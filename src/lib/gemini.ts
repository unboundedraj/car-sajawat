import "server-only";
import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

/** Shared Gemini client, or null when GEMINI_API_KEY isn't set. */
export function gemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

/** Tried in order when a model is overloaded (503) or rate-limited (429) */
const MODEL_CHAIN = [...new Set([GEMINI_MODEL, "gemini-flash-lite-latest", "gemini-2.5-flash"])];

export function isBusyError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return /\b(503|429)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|overloaded/i.test(msg);
}

/** Runs a Gemini call, falling back to lighter models while Google reports high demand. */
export async function withModelFallback<T>(call: (model: string) => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (const model of MODEL_CHAIN) {
    try {
      return await call(model);
    } catch (e) {
      lastError = e;
      if (!isBusyError(e)) throw e;
      console.warn(`[gemini] ${model} is busy, trying the next model`);
    }
  }
  throw lastError;
}
