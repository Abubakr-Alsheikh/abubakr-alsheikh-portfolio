import OpenAI from "openai";
import type {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import {
  CHAT_BASE_URL,
  CHAT_LIMITS,
  CHAT_MODEL,
  CHAT_REASONING_EFFORT,
} from "./config";
import { SYSTEM_PROMPT } from "./prompt";
import type { ChatEvent, WireMessage, WireToolCall } from "./protocol";
import { TOOL_DEFINITIONS, getTool, parseArgs, toAction } from "./tools";

/**
 * The agent loop: call the model, run the tools it asks for, append the
 * results, call it again, until it answers in text or runs out of steps.
 *
 * The request is always `[system, ...history, ...appended]`. Nothing earlier
 * is rewritten, so each call shares its whole prefix with the call before it.
 */

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  // One retry, not the SDK's default two: a 429 retried with backoff spends
  // more of the free quota and leaves the visitor watching "linking..." for
  // ten seconds before the same error.
  client ??= new OpenAI({
    apiKey,
    baseURL: CHAT_BASE_URL,
    maxRetries: 1,
    timeout: 30_000,
  });
  return client;
}

type Emit = (event: ChatEvent) => void;

/** Tool call deltas, stitched back together. */
interface PendingCall {
  id: string;
  name: string;
  arguments: string;
  extra_content?: unknown;
}

type ToolCallDelta = NonNullable<
  ChatCompletionChunk.Choice.Delta["tool_calls"]
>[number] & { extra_content?: unknown };

/**
 * Gemini's compatibility layer usually sends each call whole in one chunk,
 * sometimes without an `index`, and several parallel calls can share index 0.
 * A new `id` therefore always opens a new call; a delta without one extends
 * the call at its index, or the last call.
 */
function collect(calls: PendingCall[], delta: ToolCallDelta) {
  let call =
    delta.id !== undefined
      ? calls.find((c) => c.id === delta.id)
      : (calls[delta.index ?? -1] ?? calls.at(-1));

  if (!call) {
    call = { id: delta.id ?? `call_${calls.length}`, name: "", arguments: "" };
    calls.push(call);
  }
  if (delta.function?.name) call.name += delta.function.name;
  if (delta.function?.arguments) call.arguments += delta.function.arguments;
  if (delta.extra_content !== undefined) call.extra_content = delta.extra_content;
}

function toWireCall(call: PendingCall): WireToolCall {
  return {
    id: call.id,
    type: "function",
    function: { name: call.name, arguments: call.arguments || "{}" },
    ...(call.extra_content !== undefined
      ? { extra_content: call.extra_content }
      : {}),
  };
}

/** Runs one tool call and returns the text for its `tool` message. */
function runCall(call: PendingCall, emit: Emit): string {
  const tool = getTool(call.name);
  if (!tool) return JSON.stringify({ error: `Unknown tool: ${call.name}` });

  const args = parseArgs(call.arguments);
  emit({ type: "trace", text: tool.trace(args) });

  if (tool.side === "client") {
    const action = toAction(tool.name, args);
    if (!action) return JSON.stringify({ error: "Invalid arguments." });
    emit({ type: "action", action });
    return JSON.stringify({ ok: true, note: "Done on the visitor's screen." });
  }

  try {
    return JSON.stringify(tool.run(args));
  } catch {
    return JSON.stringify({ error: "Tool failed." });
  }
}

export class ChatOfflineError extends Error {}

/**
 * Answers the last user message in `history`. Streams events through `emit`
 * and returns the messages to append to the conversation.
 */
export async function runAgent(
  history: WireMessage[],
  emit: Emit,
  signal?: AbortSignal,
): Promise<WireMessage[]> {
  const openai = getClient();
  if (!openai) throw new ChatOfflineError("GEMINI_API_KEY is not set.");

  const appended: WireMessage[] = [];

  for (let step = 0; step < CHAT_LIMITS.maxSteps; step++) {
    const lastStep = step === CHAT_LIMITS.maxSteps - 1;

    // WireMessage matches the SDK's message shape, plus `extra_content` on
    // tool calls, which the SDK serialises through untouched.
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
      ...appended,
    ] as ChatCompletionMessageParam[];

    const stream = await openai.chat.completions.create(
      {
        model: CHAT_MODEL,
        messages,
        tools: TOOL_DEFINITIONS,
        // The last step must answer with what it has rather than ask again.
        tool_choice: lastStep ? "none" : "auto",
        max_tokens: CHAT_LIMITS.maxOutputTokens,
        ...(CHAT_REASONING_EFFORT
          ? { reasoning_effort: CHAT_REASONING_EFFORT }
          : {}),
        stream: true,
      },
      { signal },
    );

    let content = "";
    const calls: PendingCall[] = [];

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (!delta) continue;
      if (delta.content) {
        content += delta.content;
        emit({ type: "text", delta: delta.content });
      }
      for (const call of delta.tool_calls ?? []) {
        collect(calls, call as ToolCallDelta);
      }
    }

    if (calls.length === 0) {
      appended.push({ role: "assistant", content });
      return appended;
    }

    appended.push({
      role: "assistant",
      content: content || null,
      tool_calls: calls.map(toWireCall),
    });
    for (const call of calls) {
      appended.push({
        role: "tool",
        tool_call_id: call.id,
        content: runCall(call, emit),
      });
    }
  }

  // Unreachable in practice: the last step runs with tool_choice "none".
  const fallback = "Signal lost mid-query. Ask again, or run 'contact'.";
  emit({ type: "text", delta: fallback });
  appended.push({ role: "assistant", content: fallback });
  return appended;
}
