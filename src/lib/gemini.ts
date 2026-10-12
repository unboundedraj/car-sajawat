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

/** Tried in order when a model is overloaded, rate-limited or no longer offered */
const MODEL_CHAIN = [...new Set([GEMINI_MODEL, "gemini-flash-lite-latest", "gemini-3.5-flash"])];

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

export function isBusyError(e: unknown) {
  return /\b(503|429)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|overloaded/i.test(errorText(e));
}

/** The request hit a quota / rate limit (as opposed to a temporary overload) */
export function isQuotaError(e: unknown) {
  return /\b429\b|RESOURCE_EXHAUSTED|quota/i.test(errorText(e));
}

/** The model was retired or isn't available to this account */
function isModelUnavailable(e: unknown) {
  return /\b404\b|NOT_FOUND|no longer available/i.test(errorText(e));
}

/** Runs a Gemini call, falling back to other models while one is overloaded, limited or retired. */
export async function withModelFallback<T>(call: (model: string) => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (const model of MODEL_CHAIN) {
    try {
      return await call(model);
    } catch (e) {
      lastError = e;
      if (!isBusyError(e) && !isModelUnavailable(e)) throw e;
      console.warn(`[gemini] ${model} unavailable (${isModelUnavailable(e) ? "not offered" : "busy"}), trying the next model`);
    }
  }
  throw lastError;
}
