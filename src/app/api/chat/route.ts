import OpenAI from "openai";
import { ChatOfflineError, runAgent } from "@/lib/chat/agent";
import { CHAT_LIMITS } from "@/lib/chat/config";
import type {
  ChatErrorCode,
  ChatEvent,
  WireMessage,
  WireToolCall,
} from "@/lib/chat/protocol";

/**
 * POST /api/chat: the terminal agent.
 *
 * Takes `{ messages: WireMessage[] }`, the whole conversation ending with the
 * visitor's new message, and streams NDJSON `ChatEvent`s back. Runs as a
 * Netlify function; the Gemini key stays here.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- Validation ---------------------------------------------------------------
// The history comes from the browser, so every message is rebuilt from known
// fields. A system message is never accepted: the route adds its own.

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function toToolCall(v: unknown): WireToolCall | null {
  if (!isObject(v) || typeof v.id !== "string" || !isObject(v.function)) {
    return null;
  }
  const { name, arguments: args } = v.function;
  if (typeof name !== "string" || typeof args !== "string") return null;
  return {
    id: v.id,
    type: "function",
    function: { name, arguments: args },
    ...(v.extra_content !== undefined ? { extra_content: v.extra_content } : {}),
  };
}

function toMessage(v: unknown): WireMessage | null {
  if (!isObject(v)) return null;

  if (v.role === "user" && typeof v.content === "string") {
    return { role: "user", content: v.content };
  }
  if (v.role === "tool") {
    if (typeof v.tool_call_id !== "string" || typeof v.content !== "string") {
      return null;
    }
    return { role: "tool", tool_call_id: v.tool_call_id, content: v.content };
  }
  if (v.role === "assistant") {
    const content = typeof v.content === "string" ? v.content : null;
    if (!Array.isArray(v.tool_calls)) return { role: "assistant", content };
    const calls = v.tool_calls.map(toToolCall);
    if (calls.some((c) => c === null)) return null;
    return { role: "assistant", content, tool_calls: calls as WireToolCall[] };
  }
  return null;
}

type Parsed =
  | { ok: true; messages: WireMessage[] }
  | { ok: false; code: ChatErrorCode; message: string };

function parse(raw: string): Parsed {
  if (raw.length > CHAT_LIMITS.maxHistoryChars) {
    return { ok: false, code: "too_long", message: "This conversation is full. Type 'clear' to start a new one." };
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return { ok: false, code: "bad_request", message: "Malformed request." };
  }
  if (!isObject(body) || !Array.isArray(body.messages)) {
    return { ok: false, code: "bad_request", message: "Malformed request." };
  }

  const messages = body.messages.map(toMessage);
  if (messages.some((m) => m === null)) {
    return { ok: false, code: "bad_request", message: "Malformed history." };
  }
  const valid = messages as WireMessage[];

  const last = valid.at(-1);
  if (last?.role !== "user" || !last.content.trim()) {
    return { ok: false, code: "bad_request", message: "Nothing to answer." };
  }
  if (last.content.length > CHAT_LIMITS.maxInputChars) {
    return {
      ok: false,
      code: "too_long",
      message: `Keep it under ${CHAT_LIMITS.maxInputChars} characters.`,
    };
  }
  if (valid.filter((m) => m.role === "user").length > CHAT_LIMITS.maxTurns) {
    return { ok: false, code: "too_long", message: "This conversation is full. Type 'clear' to start a new one." };
  }
  return { ok: true, messages: valid };
}

// --- Rate limit -----------------------------------------------------------------
// Per function instance, so it resets whenever Netlify starts a fresh one. It
// stops one visitor hammering the free Gemini quota, not a distributed attack.

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 30;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_REQUESTS;
}

const clientIp = (req: Request) =>
  req.headers.get("x-nf-client-connection-ip") ??
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
  "unknown";

// --- Handler --------------------------------------------------------------------

const line = (event: ChatEvent) => JSON.stringify(event) + "\n";

const NDJSON = {
  "Content-Type": "application/x-ndjson; charset=utf-8",
  "Cache-Control": "no-store",
};

function errorResponse(code: ChatErrorCode, message: string, status: number) {
  return new Response(line({ type: "error", code, message }), {
    status,
    headers: NDJSON,
  });
}

export async function POST(req: Request) {
  if (limited(clientIp(req))) {
    return errorResponse("rate_limited", "Too many questions from this address. Wait a few minutes.", 429);
  }

  const parsed = parse(await req.text());
  if (!parsed.ok) return errorResponse(parsed.code, parsed.message, 400);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // A visitor who closes the terminal mid-answer aborts the request, and
      // the stream is closed under the loop. Drop what it still emits.
      const emit = (event: ChatEvent) => {
        if (req.signal.aborted) return;
        controller.enqueue(encoder.encode(line(event)));
      };

      try {
        const messages = await runAgent(parsed.messages, emit, req.signal);
        emit({ type: "done", messages });
      } catch (error) {
        if (error instanceof ChatOfflineError) {
          emit({ type: "error", code: "offline", message: "Uplink offline." });
        } else if (
          error instanceof OpenAI.APIError &&
          (error.status === 429 || (error.status ?? 0) >= 500)
        ) {
          // The provider's quota or capacity, not this visitor's doing.
          emit({
            type: "error",
            code: "busy",
            message: "Provider busy. Try again shortly.",
          });
        } else if (!req.signal.aborted) {
          console.error("[api/chat]", error);
          emit({ type: "error", code: "upstream", message: "Uplink failed." });
        }
      } finally {
        if (!req.signal.aborted) controller.close();
      }
    },
  });

  return new Response(stream, { headers: NDJSON });
}
