/**
 * One clock for everything decorative that redraws on its own: the starfield,
 * the holograms and the planets' SMIL.
 *
 * Each of those used to run at the display's full rate, on its own schedule. On
 * a page this size a frame with anything dirty in it costs real time, because
 * the browser has to paint and layerize the whole document, so three loops on
 * three schedules meant nearly every vsync was a full frame: the main thread sat
 * at 80-100% on a page where nothing was happening. At rest a slow star does not
 * need 144 updates a second.
 *
 * So they share one rAF loop at 30Hz and all land in the same frame, which leaves
 * the frames between them clean. Scrolling or dragging asks for more with
 * `requestFastFrames`, up to 60Hz, for as long as it lasts.
 *
 * A subscriber gets elapsed milliseconds, so anything it moves stays the same
 * speed at any rate. A hidden tab gets no rAF, and with no subscribers the loop
 * stops altogether.
 */

export type FrameTick = (dtMs: number, nowMs: number) => void;

const REST_MS = 1000 / 30;
const FAST_MS = 1000 / 60;
/** Slack, so a 33ms budget lands on every second 60Hz frame and not every third. */
const SLACK_MS = 4;

const subscribers = new Set<FrameTick>();
let fastUntil = 0;
let last = 0;
let running = false;

function loop(now: number) {
  if (subscribers.size === 0) {
    running = false;
    return;
  }
  requestAnimationFrame(loop);
  const budget = now < fastUntil ? FAST_MS : REST_MS;
  const dt = now - last;
  if (dt < budget - SLACK_MS) return;
  last = now;
  for (const tick of subscribers) tick(dt, now);
}

/** Runs `tick` on the shared clock. Returns the function that stops it. */
export function onFrame(tick: FrameTick): () => void {
  subscribers.add(tick);
  if (!running) {
    running = true;
    last = performance.now();
    requestAnimationFrame(loop);
  }
  return () => {
    subscribers.delete(tick);
  };
}

/** Keeps the clock at its fast rate for the next `ms`. Call it as often as you like. */
export function requestFastFrames(ms = 200) {
  fastUntil = Math.max(fastUntil, performance.now() + ms);
}
