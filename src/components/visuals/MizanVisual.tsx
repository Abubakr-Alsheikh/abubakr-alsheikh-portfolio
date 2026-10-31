"use client";

import Hologram from "./Hologram";
import { mizanSystem } from "@/lib/data/mizanSystem";

/** Mizan's route from one message to one number, as a hologram. */
export default function MizanVisual() {
  return <Hologram system={mizanSystem} />;
}
