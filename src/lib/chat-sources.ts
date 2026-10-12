// The chat route streams plain text. When Gemini used Google Search, the sources are appended
// after this marker as JSON, so the widget can show them as links (and keep model text link-safe).
export const SOURCES_MARKER = "\n\n\u241Fsources\u241F";

export type ChatSources = {
  links: { title: string; url: string }[];
  /** Google's "Search Suggestions" chip bar (HTML), shown in a sandboxed frame as Google requires */
  searchSuggestionsHtml?: string;
};

export function splitSources(text: string): { answer: string; sources: ChatSources | null } {
  const i = text.indexOf(SOURCES_MARKER);
  if (i === -1) return { answer: text, sources: null };
  const answer = text.slice(0, i);
  try {
    const parsed = JSON.parse(text.slice(i + SOURCES_MARKER.length));
    const links = Array.isArray(parsed?.links)
      ? parsed.links.filter((l: { url?: unknown }) => typeof l?.url === "string" && /^https:\/\//.test(l.url)).slice(0, 5)
      : [];
    return { answer, sources: { links, searchSuggestionsHtml: typeof parsed?.searchSuggestionsHtml === "string" ? parsed.searchSuggestionsHtml : undefined } };
  } catch {
    return { answer, sources: null }; // marker arrived but the JSON is still streaming in
  }
}
