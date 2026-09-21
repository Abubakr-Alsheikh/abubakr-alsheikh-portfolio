/**
 * The wire format between the terminal and `/api/chat`. Imported by both
 * sides, so it holds types and constants only: no data, no SDK.
 *
 * The conversation lives in the browser. Each request carries the whole
 * history, including the assistant's tool calls and the tool results, and the
 * route appends to it and sends the new messages back in the `done` event. The
 * history therefore only ever grows at the end, which is what keeps every
 * earlier message a cacheable prefix.
 */

/** Section ids the agent may scroll to. Must match `NAV_LINKS` in `TelemetryNav`. */
export const SECTIONS = [
  "hero",
  "about",
  "projects",
  "archive",
  "journey",
  "engine",
  "contact",
] as const;

export type SectionId = (typeof SECTIONS)[number];

/** Characters in one visitor message. The input caps it, the route enforces it. */
export const MAX_INPUT_CHARS = 500;

export interface WireToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
  /**
   * Provider data attached to the call. Gemini 3 puts its thought signature
   * here and rejects the next request if the call comes back without it, so
   * it is stored and returned untouched.
   */
  extra_content?: unknown;
}

export type WireMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: WireToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

/** Page actions the agent asks the terminal to perform. */
export type ChatAction =
  | { name: "navigate"; section: SectionId }
  | { name: "prefill_contact"; message: string };

export type ChatErrorCode =
  | "offline"
  | "rate_limited"
  | "too_long"
  | "bad_request"
  | "upstream";

/** One line of the NDJSON response stream. */
export type ChatEvent =
  | { type: "trace"; text: string }
  | { type: "action"; action: ChatAction }
  | { type: "text"; delta: string }
  | { type: "done"; messages: WireMessage[] }
  | { type: "error"; code: ChatErrorCode; message: string };
