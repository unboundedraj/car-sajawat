import { z } from "zod";
import { buildChatSystemPrompt } from "@/lib/chat-context";
import { getSiteContent } from "@/lib/data";
import { SOURCES_MARKER, type ChatSources } from "@/lib/chat-sources";
import { gemini, isQuotaError, withModelFallback } from "@/lib/gemini";

export const maxDuration = 30;

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        text: z.string().trim().min(1).max(1000),
      }),
    )
    .min(1)
    .max(20),
});

// Best-effort per-instance rate limit: 20 messages / 5 min per IP
const WINDOW_MS = 5 * 60 * 1000;
const LIMIT = 20;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > LIMIT;
}

// Google Search grounding isn't part of every API plan. When Google refuses it (quota), answer
// without it and stop trying for a while so visitors don't pay for the failed attempts.
let searchPausedUntil = 0;
const SEARCH_PAUSE_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const client = gemini();
  if (!client) {
    return new Response("The assistant isn't configured yet. Please reach us on WhatsApp!", { status: 503 });
  }

  const { chatbot } = await getSiteContent();
  if (!chatbot.enabled) return new Response("The assistant is currently offline.", { status: 503 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return new Response("You're sending messages quickly. Please wait a moment, or message us on WhatsApp.", {
      status: 429,
    });
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return new Response("Invalid request.", { status: 400 });
  }
  // Gemini expects the conversation to start with a user turn
  const firstUser = parsed.messages.findIndex((m) => m.role === "user");
  if (firstUser === -1) return new Response("Invalid request.", { status: 400 });
  const messages = parsed.messages.slice(firstUser);

  try {
    const systemInstruction = await buildChatSystemPrompt();
    const generate = (withSearch: boolean) =>
      withModelFallback((model) =>
        client.models.generateContentStream({
          model,
          contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
          config: {
            systemInstruction,
            // Lets the assistant look things up on the web when the catalogue and business facts don't cover a question
            ...(withSearch ? { tools: [{ googleSearch: {} }] } : {}),
            temperature: 0.5,
            // Room for "thinking" models plus a researched answer
            maxOutputTokens: 1500,
          },
        }),
      );

    let stream;
    if (Date.now() < searchPausedUntil) {
      stream = await generate(false);
    } else {
      try {
        stream = await generate(true);
      } catch (err) {
        if (!isQuotaError(err)) throw err;
        console.warn("[chat] Google Search grounding unavailable (quota); answering without web search for 15 minutes");
        searchPausedUntil = Date.now() + SEARCH_PAUSE_MS;
        stream = await generate(false);
      }
    }

    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const seen = new Map<string, string>();
          let suggestions: string | undefined;
          for await (const chunk of stream) {
            if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
            const grounding = chunk.candidates?.[0]?.groundingMetadata;
            for (const g of grounding?.groundingChunks ?? []) {
              if (g.web?.uri && !seen.has(g.web.uri)) seen.set(g.web.uri, g.web.title || new URL(g.web.uri).hostname);
            }
            if (grounding?.searchEntryPoint?.renderedContent) suggestions = grounding.searchEntryPoint.renderedContent;
          }
          if (seen.size || suggestions) {
            const sources: ChatSources = {
              links: [...seen].slice(0, 5).map(([url, title]) => ({ title, url })),
              searchSuggestionsHtml: suggestions,
            };
            controller.enqueue(encoder.encode(SOURCES_MARKER + JSON.stringify(sources)));
          }
        } catch (err) {
          console.error("[chat] stream error:", err);
          controller.enqueue(encoder.encode("\n\nSorry, something went wrong. Please try again or message us on WhatsApp."));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[chat] request failed:", err);
    return new Response("The assistant is busy right now. Please try again, or message us on WhatsApp.", {
      status: 502,
    });
  }
}
