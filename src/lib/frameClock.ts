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
 * the frames between them clean. Scrolling, dragging or a meteor in flight asks
 * for the fast rate with `requestFastFrames`, for as long as it lasts.
 *
 * Both rates step on an even beat of the display: every Nth vsync, with N fixed
 * for the rate. A millisecond budget lands on two vsyncs, then three, then two
 * at 144Hz, and that uneven step judders against a page that scrolls on every
 * one. So the loop measures the display's interval and counts vsyncs instead.
 *
 * A subscriber gets elapsed milliseconds, so anything it moves stays the same
 * speed at any rate. A hidden tab gets no rAF, and with no subscribers the loop
 * stops altogether.
 */

export type FrameTick = (dtMs: number, nowMs: number) => void;

const REST_MS = 1000 / 30;
const FAST_MS = 1000 / 60;

const subscribers = new Set<FrameTick>();
let fastUntil = 0;
let last = 0;
let running = false;
/** The display's frame interval, learned as the loop runs. */
let vsync = 1000 / 60;
let prev = 0;
let count = 0;

/** Every how many vsyncs a rate steps: 2 for 60Hz on a 144Hz screen, 1 on a 60Hz one. */
const every = (ms: number) => Math.max(1, Math.round(ms / vsync));

function loop(now: number) {
  if (subscribers.size === 0) {
    running = false;
    return;
  }
  requestAnimationFrame(loop);
  const gap = now - prev;
  prev = now;
  // Learn the interval from ordinary frames only, not from a tab coming back.
  if (gap > 2 && gap < 50) vsync += (gap - vsync) * 0.05;
  count += 1;
  if (count % every(now < fastUntil ? FAST_MS : REST_MS) !== 0) return;
  const dt = now - last;
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
