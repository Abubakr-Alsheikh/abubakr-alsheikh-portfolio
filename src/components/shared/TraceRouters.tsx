"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { useTraceFill } from "@/hooks/useTraceFill";

/**
 * Corner budget, expressed in the router's own scroll range.
 *
 * The entry drop is centre-tracked 1:1 (0 -> CORNER), so its seam with the
 * section above is pixel-exact. The lateral run then draws while the front is
 * parked on the junction box, and the exit drop makes that time back by
 * running slightly ahead of the scroll, so it still lands exactly on the seam
 * with the section below. The drawn path stays contiguous at every scroll
 * position: the trace never breaks, it only dwells for a beat on the corner.
 */
const CORNER = 0.5;
const RUN = 0.16;

const PALETTE = {
  technical: {
    bar: "bg-[#F97316] shadow-[0_0_10px_#F97316]",
    packet: "border-[#F97316] shadow-[0_0_10px_#F97316]",
    junction: "border-[#F97316]",
  },
  azure: {
    bar: "bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]",
    packet: "border-[#3B82F6] shadow-[0_0_10px_#3B82F6]",
    junction: "border-[#3B82F6]",
  },
} as const;

type Channel = keyof typeof PALETTE;

const COLUMN = {
  center: "left-1/2 -translate-x-1/2",
  left: "left-[4rem]",
} as const;

type Column = keyof typeof COLUMN;

/** Only the leg the front currently sits on carries a lit packet. */
const usePacket = (progress: MotionValue<number>, from: number, to: number) =>
  useTransform(progress, [from, from + 0.004, to - 0.004, to], [0, 1, 1, 0]);

const Packet = ({
  opacity,
  channel,
  className,
}: {
  opacity: MotionValue<number>;
  channel: Channel;
  className: string;
}) => (
  <motion.div
    style={{ opacity }}
    className={`absolute w-3 h-3 bg-[#020617] border-2 rounded-full flex items-center justify-center z-20 ${PALETTE[channel].packet} ${className}`}
  >
    <div className="w-1 h-1 bg-white rounded-full" />
  </motion.div>
);

type BranchProps = {
  /** Column the trace arrives in; it leaves in the other one. */
  entry: Column;
  /** Channel of the section above the router. */
  entryChannel: Channel;
  /** Channel of the section below it — the run already carries this colour. */
  exitChannel: Channel;
};

const Branch = ({ entry, entryChannel, exitChannel }: BranchProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { progress } = useTraceFill(ref);

  const entryDrop = useTransform(progress, [0, CORNER], ["0%", "100%"]);
  const run = useTransform(progress, [CORNER, CORNER + RUN], ["0%", "100%"]);
  const exitDrop = useTransform(progress, [CORNER + RUN, 1], ["0%", "100%"]);

  const entryPacket = usePacket(progress, 0, CORNER);
  const runPacket = usePacket(progress, CORNER, CORNER + RUN);
  const exitPacket = usePacket(progress, CORNER + RUN, 1);

  const exit: Column = entry === "center" ? "left" : "center";
  const fromCenter = entry === "center";

  return (
    <div
      ref={ref}
      className="w-full flex justify-center h-32 md:h-48 z-10 pointer-events-none relative"
    >
      <div className="w-full max-w-7xl mx-auto relative h-full hidden md:block">
        {/* 1. Entry drop — the section above, continued */}
        <div
          className={`absolute top-0 h-1/2 w-px bg-slate-800/50 ${COLUMN[entry]}`}
        >
          <motion.div
            style={{ height: entryDrop }}
            className={`w-full relative ${PALETTE[entryChannel].bar}`}
          >
            <Packet
              opacity={entryPacket}
              channel={entryChannel}
              className="-bottom-1.5 left-1/2 -translate-x-1/2"
            />
          </motion.div>
        </div>

        {/* 2. Lateral run, drawn away from the entry column */}
        <div className="absolute top-1/2 left-[4rem] right-1/2 h-px bg-slate-800/50">
          <motion.div
            style={{ width: run }}
            className={`absolute top-0 h-full ${fromCenter ? "right-0" : "left-0"} ${PALETTE[exitChannel].bar}`}
          >
            <Packet
              opacity={runPacket}
              channel={exitChannel}
              className={`top-1/2 -translate-y-1/2 ${fromCenter ? "-left-1.5" : "-right-1.5"}`}
            />
          </motion.div>
        </div>

        {/* 3. Exit drop — handed straight to the section below */}
        <div
          className={`absolute top-1/2 bottom-0 w-px bg-slate-800/50 ${COLUMN[exit]}`}
        >
          <motion.div
            style={{ height: exitDrop }}
            className={`w-full relative ${PALETTE[exitChannel].bar}`}
          >
            <Packet
              opacity={exitPacket}
              channel={exitChannel}
              className="-bottom-1.5 left-1/2 -translate-x-1/2"
            />
          </motion.div>
        </div>

        {/* Physical hardware junction boxes (sit underneath the packets) */}
        <div
          className={`absolute top-1/2 left-[4rem] w-2 h-2 -translate-x-[4px] -translate-y-[4px] bg-[#020617] border rounded-sm z-10 ${PALETTE.azure.junction}`}
        />
        <div
          className={`absolute top-1/2 left-1/2 w-2 h-2 -translate-x-[4px] -translate-y-[4px] bg-[#020617] border rounded-sm z-10 ${PALETTE.technical.junction}`}
        />
      </div>
    </div>
  );
};

export const BranchCenterToLeft = () => (
  <Branch entry="center" entryChannel="technical" exitChannel="azure" />
);

export const BranchLeftToCenter = () => (
  <Branch entry="left" entryChannel="azure" exitChannel="technical" />
);
