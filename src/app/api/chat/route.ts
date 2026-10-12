import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { buildChatSystemPrompt } from "@/lib/chat-context";
import { getSiteContent } from "@/lib/data";

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

let client: GoogleGenAI | null = null;

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
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
  const messages = parsed.messages.slice(parsed.messages.findIndex((m) => m.role === "user"));

  client ??= new GoogleGenAI({ apiKey });

  try {
    const stream = await client.models.generateContentStream({
      model: process.env.GEMINI_MODEL || "gemini-flash-latest",
      contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      config: {
        systemInstruction: await buildChatSystemPrompt(),
        temperature: 0.5,
        maxOutputTokens: 600,
      },
    });

    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
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
