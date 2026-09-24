"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLenisInstance } from "./LenisProvider";

/**
 * Route changes between the home page and the case studies, played as a
 * docking sequence: two blast doors close over the page, a readout names the
 * destination, the route changes behind them, and the doors open on the new
 * page already at the right scroll position.
 *
 * Scroll is ours, not the router's. Lenis keeps its own position across a
 * client navigation, which is why a case study used to open at the bottom, so
 * every push goes out with `scroll: false` and `land()` places the page while
 * the doors are shut:
 *  - a case study always opens at the top;
 *  - the home page returns to the exact scroll offset the visitor left from
 *    (RETURN_KEY in sessionStorage), falling back to the URL hash.
 *
 * The browser's own back and forward buttons skip the doors but still land
 * the page, so they return to the same spot too.
 */

const RETURN_KEY = "orbital.return.y";

/** Minimum time the doors stay shut, so the readout can be read. */
const HOLD_MS = 420;

const DOOR = { type: "spring", stiffness: 210, damping: 30, mass: 0.9 } as const;

export interface WarpLabel {
  /** Small line above the title, e.g. "SYS.MOD_02 // CASE_STUDY". */
  kicker: string;
  title: string;
}

type Phase = "idle" | "closing" | "closed" | "opening";

interface WarpApi {
  go: (href: string, label: WarpLabel) => void;
}

const WarpContext = createContext<WarpApi>({ go: () => {} });

export const useWarp = () => useContext(WarpContext);

function readReturn(): number | null {
  try {
    const raw = window.sessionStorage.getItem(RETURN_KEY);
    window.sessionStorage.removeItem(RETURN_KEY);
    return raw === null ? null : Number(raw);
  } catch {
    return null;
  }
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenisInstance();
  const reduce = useReducedMotion();

  const [phase, setPhase] = useState<Phase>("idle");
  const [label, setLabel] = useState<WarpLabel>({ kicker: "", title: "" });
  const pending = useRef<string | null>(null);
  const lastPath = useRef(pathname);
  const shutAt = useRef(0);

  const scrollTo = useCallback(
    (y: number) => {
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(y, { immediate: true, force: true });
      } else {
        window.scrollTo(0, y);
      }
    },
    [lenis],
  );

  const land = useCallback(
    (path: string, saved: number | null) => {
      if (path !== "/") {
        scrollTo(0);
        return;
      }
      if (saved !== null && Number.isFinite(saved)) {
        scrollTo(saved);
        return;
      }
      const id = window.location.hash.slice(1);
      const el = id ? document.getElementById(id) : null;
      if (el) scrollTo(el.getBoundingClientRect().top + window.scrollY);
    },
    [scrollTo],
  );

  const go = useCallback(
    (href: string, next: WarpLabel) => {
      if (phase !== "idle") return;
      // Leaving the home page: remember where, so the way back lands here.
      if (window.location.pathname === "/") {
        try {
          window.sessionStorage.setItem(RETURN_KEY, String(window.scrollY));
        } catch {}
      }
      if (reduce) {
        router.push(href, { scroll: false });
        return;
      }
      pending.current = href;
      setLabel(next);
      lenis?.stop();
      setPhase("closing");
    },
    [phase, reduce, router, lenis],
  );

  // The doors are shut: change the route behind them.
  const onDoorSettled = () => {
    if (phase === "closing") {
      setPhase("closed");
      shutAt.current = performance.now();
      const href = pending.current;
      pending.current = null;
      if (href) router.push(href, { scroll: false });
    } else if (phase === "opening") {
      setPhase("idle");
      lenis?.start();
    }
  };

  // The new route has rendered: place it, then open the doors.
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    // Read once: the key is cleared on read, and `land` runs twice.
    const saved = pathname === "/" ? readReturn() : null;

    // Twice: once now, once after the next layout pass, because the incoming
    // page's height is still settling on the first frame.
    let second = 0;
    const first = requestAnimationFrame(() => {
      land(pathname, saved);
      second = requestAnimationFrame(() => land(pathname, saved));
    });

    let open = 0;
    if (phase === "closed") {
      const waited = performance.now() - shutAt.current;
      open = window.setTimeout(
        () => setPhase("opening"),
        Math.max(120, HOLD_MS - waited),
      );
    }

    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      window.clearTimeout(open);
    };
    // `phase` is read, not tracked: this runs once per route change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, land]);

  const shut = phase === "closing" || phase === "closed";

  return (
    <WarpContext.Provider value={{ go }}>
      {children}

      <div
        aria-hidden={!shut}
        className={`fixed inset-0 z-[110] ${phase === "idle" ? "pointer-events-none" : ""}`}
      >
        {/* Top door */}
        <motion.div
          initial={false}
          animate={{ y: shut ? "0%" : "-101%" }}
          transition={DOOR}
          onAnimationComplete={onDoorSettled}
          className="absolute inset-x-0 top-0 h-1/2 bg-[#020617] border-b border-[#F97316]"
        >
          <DoorFace edge="bottom" />
        </motion.div>

        {/* Bottom door */}
        <motion.div
          initial={false}
          animate={{ y: shut ? "0%" : "101%" }}
          transition={DOOR}
          className="absolute inset-x-0 bottom-0 h-1/2 bg-[#020617] border-t border-[#F97316]"
        >
          <DoorFace edge="top" />
        </motion.div>

        {/* Seam flare: runs out along the join as the doors meet. */}
        <motion.div
          initial={false}
          animate={{
            scaleX: phase === "closed" ? 1 : 0,
            opacity: phase === "closed" ? 1 : 0,
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-[#F97316] shadow-[0_0_18px_#F97316] origin-center"
        />

        {/* Readout, over the seam. */}
        <motion.div
          initial={false}
          animate={{
            opacity: phase === "closed" ? 1 : 0,
            y: phase === "closed" ? 0 : 8,
          }}
          transition={{ duration: 0.22 }}
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center px-6"
        >
          <div className="relative bg-[#020617] border border-slate-800 px-6 py-5 md:px-10 md:py-6 min-w-[260px] max-w-xl">
            <span className="absolute top-1 left-1 w-1 h-1 bg-[#F97316]" />
            <span className="absolute bottom-1 right-1 w-1 h-1 bg-[#F97316]" />
            <p className="flex items-center gap-2 font-mono text-[9px] md:text-[10px] tracking-widest uppercase text-[#F97316] mb-3">
              <span className="hud-blink w-1.5 h-1.5 bg-[#F97316]" />
              {label.kicker}
            </p>
            <p className="font-space font-bold tracking-tighter text-slate-100 text-3xl md:text-5xl leading-none">
              {label.title}
            </p>
            <div className="mt-4 h-px w-full bg-slate-800 overflow-hidden">
              <motion.div
                initial={false}
                animate={{ scaleX: phase === "closed" ? 1 : 0 }}
                transition={{
                  duration: phase === "closed" ? HOLD_MS / 1000 : 0,
                  ease: "linear",
                }}
                className="h-full bg-[#3B82F6] origin-left"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </WarpContext.Provider>
  );
}

/** Tick marks and a hazard strip along a door's meeting edge. */
function DoorFace({ edge }: { edge: "top" | "bottom" }) {
  const at = edge === "bottom" ? "bottom-0" : "top-0";
  const ticksAt = edge === "bottom" ? "bottom-3" : "top-3";
  return (
    <>
      <div
        className={`absolute inset-x-0 ${at} h-2 opacity-60 [background:repeating-linear-gradient(135deg,#F97316_0_6px,transparent_6px_16px)]`}
      />
      <div className={`absolute inset-x-6 md:inset-x-14 ${ticksAt} flex justify-between`}>
        {Array.from({ length: 24 }, (_, i) => (
          <span
            key={i}
            className={`w-px ${i % 4 === 0 ? "h-3 bg-slate-500" : "h-1.5 bg-slate-700"}`}
          />
        ))}
      </div>
      <span
        className={`absolute left-6 md:left-14 ${edge === "bottom" ? "bottom-7" : "top-7"} font-mono text-[9px] tracking-widest uppercase text-slate-400`}
      >
        {edge === "bottom" ? "Bulkhead_A // Sealed" : "Bulkhead_B // Sealed"}
      </span>
    </>
  );
}

type WarpLinkProps = Omit<ComponentProps<typeof Link>, "href" | "onClick"> & {
  href: string;
  warp: WarpLabel;
};

/**
 * A `next/link` that travels through the doors. Modified clicks (new tab,
 * new window) keep the browser's default.
 */
export function WarpLink({ href, warp, ...rest }: WarpLinkProps) {
  const { go } = useWarp();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    go(href, warp);
  };
  return <Link href={href} onClick={onClick} {...rest} />;
}
