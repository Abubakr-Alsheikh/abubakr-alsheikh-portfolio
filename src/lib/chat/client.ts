import type { ChatEvent, WireMessage } from "./protocol";

/**
 * Browser side of `/api/chat`: posts the conversation and hands each NDJSON
 * event to `onEvent` as it arrives.
 */
export async function streamChat(
  messages: WireMessage[],
  onEvent: (event: ChatEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.body) {
    onEvent({ type: "error", code: "upstream", message: "Uplink failed." });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let garbled = false;

  const flush = (chunk: string) => {
    if (!chunk.trim() || garbled) return;
    try {
      onEvent(JSON.parse(chunk) as ChatEvent);
    } catch {
      // A line that is not JSON is a proxy error page, not an event. Report
      // it once and ignore the rest of the page.
      garbled = true;
      onEvent({ type: "error", code: "upstream", message: "Uplink failed." });
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    lines.forEach(flush);
  }
  flush(buffer + decoder.decode());
}
