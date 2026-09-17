import { useEffect, useState } from "react";
import Lenis from "lenis";

/**
 * Owns the page's smooth-scroll engine and hands the instance back so callers
 * can drive it. Anything that scrolls the page programmatically must go through
 * this instance: a native `scrollTo`/`scrollIntoView` with `behavior: "smooth"`
 * runs its own animation alongside Lenis and the two fight for the scroll
 * position the whole way down.
 */
const useLenis = () => {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    // The loop re-schedules itself, so cleanup has to cancel the frame that is
    // actually pending — holding only the first id leaks the loop past unmount.
    let frame = 0;
    const raf = (time: number) => {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    setLenis(instance);

    return () => {
      cancelAnimationFrame(frame);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return lenis;
};

export default useLenis;
