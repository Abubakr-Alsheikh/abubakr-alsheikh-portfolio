import { MAX_INPUT_CHARS } from "./protocol";

/**
 * Terminal agent settings. Server-only values read `process.env`; nothing here
 * is `NEXT_PUBLIC_`, so the key never reaches the browser bundle.
 */

/**
 * Gemini's OpenAI-compatible endpoint, used through the `openai` SDK.
 * `GEMINI_BASE_URL` points it elsewhere, e.g. at a local stub for tests.
 */
export const CHAT_BASE_URL =
  process.env.GEMINI_BASE_URL ??
  "https://generativelanguage.googleapis.com/v1beta/openai/";

/** Override with `GEMINI_MODEL` when Google renames or promotes the model. */
export const CHAT_MODEL =
  process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite-preview";

/**
 * Optional thinking budget ("minimal", "low", "medium", "high"). Unset uses
 * the model's default. "minimal" made no measurable difference to latency in
 * testing: on the free tier the wait is mostly queueing on Google's side.
 */
export const CHAT_REASONING_EFFORT = process.env.GEMINI_REASONING_EFFORT as
  | "minimal"
  | "low"
  | "medium"
  | "high"
  | undefined;

/** Links in tool results are absolute, or the model invents a domain. */
export const SITE_URL = "https://abubakr-alsheikh.netlify.app";

export const CHAT_LIMITS = {
  /** Model calls per visitor message. Each tool round trip spends one. */
  maxSteps: 4,
  maxInputChars: MAX_INPUT_CHARS,
  /** Visitor messages per conversation before `clear` is required. */
  maxTurns: 16,
  /** Whole history sent by the client, as JSON. Guards the request size. */
  maxHistoryChars: 60_000,
  /** Tokens in one model reply. Terminal answers are short. */
  maxOutputTokens: 700,
} as const;
