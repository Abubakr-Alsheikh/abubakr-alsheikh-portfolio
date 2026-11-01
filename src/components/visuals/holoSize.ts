/**
 * A hologram panel's box. The real panel and the frame that stands in while it
 * loads must share these, or the page shifts when the panel mounts.
 */
export const HOLO_SIZE = "aspect-[16/9] min-h-[600px] xl:min-h-[520px]";
export const HOLO_SIZE_WITH_INSTRUMENT = "aspect-[16/9] min-h-[680px] sm:min-h-[600px]";

/** The projects that have a hologram. Plain data, so a server page can ask too. */
const HOLOGRAMS = new Set(["qader", "mizan", "max-cli", "nanomanga-studio", "school-management-system"]);
export const hasVisual = (slug: string) => HOLOGRAMS.has(slug);
