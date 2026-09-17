# Agents.md - Abubakr Alsheikh Portfolio System

## 1. Project Identity & Archetype

This is an **Aerospace-Grade Software Engineering Portfolio**. It is not a generic website; it is a high-fidelity, hardware-themed HUD (Heads-Up Display) experience designed to showcase elite technical execution.

- **Name**: Abubakr Alsheikh Portfolio
- **Archetype**: High-Tech Aerospace/Industrial HUD
- **Primary Language**: TypeScript (Strict Typing)
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS 4.0 (Fluid Typography, Precision Spacing)
- **Animations**: Framer Motion (Physics-based, not magic)
- **Theme**: Deep Space / Geometric Dawn (Dark Mode strictly enforced)

## 2. Essential Commands

Always prioritize file-scoped interactions for faster feedback loops.

```bash
# Development
npm run dev              # Start HUD simulation (Next.js Dev)
npm run build            # Compile production-grade telemetry (Next.js Build)

# Quality Assurance
npm run lint             # Execute code-quality diagnostics
npx tsc --noEmit         # Full type-safety check
```

## 3. Project Architecture Map (The HUD Structure)

```
src/
├── app/                  # Route Manifest & Metadata (Layout, Page, Sitemap)
├── components/           
│   ├── sections/         # Flush-stacked UI blocks (Hero, About, Engine)
│   ├── shared/           # HUD Telemetry, Navigation, & Circuit Routing
│   ├── ui/               # Primitive Radix/Shadcn UI components
│   └── visuals/          # Complex SVG/Canvas Aerospace environments
├── hooks/                # HUD state logic (Trace Continuity, Scroll Velocity, Boot)
├── lib/                  
│   ├── data/             # Centralized source of truth for all content
│   └── utils.ts          # Tailwind merging & logic helpers
└── public/               # Static hardware assets & optimized fonts
```

## 4. Code Standards & Patterns (The Design Manifesto)

### Visual Philosophy

- **Anti-AI Slop**: Zero generic purple/blue gradients. Zero soft "glassmorphism" blobs.
- **Hardware Sharpness**: All cards must use `bg-[#020617] border border-slate-800` with 1px corner accents.
- **Typography**:
  - **Space Grotesk**: For massive, heavy geometric headers (`tracking-tighter`).
  - **JetBrains Mono**: For all data, labels, and paragraph readouts.
- **Circuit Trace Lines**: Sections must be interconnected by an unbroken vertical line. Use `BranchCenterToLeft` and `BranchLeftToCenter` routers for 90-degree transitions.
- **Trace Continuity Contract**: Never hand-roll a scroll-linked trace rail. Wrap the page column in `<TraceField>` (`src/components/shared/TraceField.tsx`) and drive every rail through `useTraceFill(railRef)` (`src/hooks/useTraceFill.ts`). Three rules make the page read as one line, and breaking any one of them tears it:
  1. The ref goes on the **rail element**, not on the `<section>`. A section's `pt-`/`pb-` would otherwise offset the rail from the scroll range driving it.
  2. **Smooth once, in the field.** `TraceField` publishes a single spring-smoothed front (`TRACE_SPRING`) for the whole page. A rail must never add a `useSpring` of its own — thirteen independent springs are thirteen chances to fall out of phase.
  3. **Clamp after the shared front, never before.** Each rail converts that one front into its own local fill and clamps the result. Smoothing a per-section `scrollYProgress` and clamping first (the pre-2026-09 pattern) lets the rail above settle towards "full" while the rail below has already started, and the difference opens a hole at the seam as wide as the current scroll velocity. Clamping a shared front cannot do that, however far behind the scroll the smoothing lags — which is precisely why the easing is allowed to be generous.
- **The Front Must Reach The End**: The front is the viewport centre line, except over the final half-viewport of scroll, where `traceFront()` ramps it to 2x. Without that ramp the centre line tops out at `documentHeight - viewportHeight / 2` and the last rail is stranded permanently part-drawn no matter how far you scroll. Any new full-bleed section at the foot of the page inherits this for free; do not re-derive it.

### Technical Standards

- **Zero CLS**: Use fixed aspect ratios for visual modules and `next/image` for all assets.
- **Modular Data**: Content is strictly separated from presentation. Edit `src/lib/data/` only.
- **Client/Server Split**: Mark interactive HUD elements with `"use client"`. Keep sections as server components where possible.

## 5. Quality Gates & Workflow (Definition of "Done")

- [ ] UI is pixel-perfect against the "Aerospace HUD" aesthetic.
- [ ] Performance: LCP < 1.2s, Zero Layout Shift.
- [ ] Responsive: Telemetry Nav adapts flawlessly from mobile to ultra-wide.
- [ ] Motion: Animations use physics-based `spring` configurations (damping: 30-50).
- [ ] Trace Line Continuity: The vertical circuit line never breaks between sections.

## 6. Boundaries & Permissions

### ✅ Always Do

- Follow the "Hardware Screw" pattern: add tiny `w-1 h-1` corner squares to high-level cards.
- Use `text-[clamp(x,y,z)]` for headers to ensure aerospace-grade fluid scaling.
- Keep sections flush (no vertical margins on `<section>` wrappers).

### ⚠️ Ask First Before

- Adding new external animation libraries.
- Changing the global color palette (`#020617`, `#3B82F6`, `#F97316`).
- Altering the `TelemetryNav` logic.

### 🚫 Never Do

- Never use generic rounded pills (`rounded-full`) for technical data.
- Never use Inter, Arial, or standard sans-serif for primary UI.
- Never commit with `any` types.

## 7. Reference Implementations (The "Gold Standard")

- **Complex HUD Logic**: `src/components/shared/TelemetryNav.tsx` (Velocity tracking & SVG graphs).
- **Physics Environment**: `src/components/visuals/DeepSpaceEnvironment.tsx` (Canvas parallax).
- **Circuit Routing**: `src/components/shared/TraceRouters.tsx` (90-degree column changes, built on one parametrised `Branch`).
- **Trace Continuity**: `src/components/shared/TraceField.tsx` (One smoothed front for the page) and `src/hooks/useTraceFill.ts` (How a rail consumes it).
- **Technical Visuals**: `src/components/visuals/QaderVisual.tsx` (SVG pipeline animation).

## 8. Escalation & Discovery

1. **Sync with Data**: Check `src/lib/data/` for content schemas before modifying a section.
2. **Review Geometry**: Use the browser inspector to ensure trace lines align to the pixel.
3. **Trace Back**: If a line is broken, check the `pt-` and `pb-` values in the section's inner container.

## 9. Stack-Specific Diagnostics

- **Next.js**: Strict App Router usage. No `pages/` directory.
- **Tailwind**: Use `@theme inline` in `globals.css` for custom aerospace variables.
- **Framer Motion**: Use `useScroll` and `useTransform` for scroll-linked telemetry.

## 10. The Anti-Slop Manifesto (Code & Design)

To maintain "World-Class" status, all contributions must pass the "Slop Filter." If a component looks like a generic AI output, it is a failure.

### 🚫 Design Slop (Visual Taboos)

- **No Soft Blobs**: Avoid blurred background circles. Use sharp geometric SVG patterns or noise textures instead.
- **No Pill Buttons**: Use sharp-cornered (`rounded-none` or `rounded-sm`) buttons with 1px borders.
- **No Centering Bias**: Avoid `text-center` for long blocks. Use asymmetric layouts; titles top-left, descriptions bottom-right.
- **No Generic Shadows**: Use `shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)]` for depth, or better yet, use border-glows (`shadow-[0_0_15px_#3B82F6]`).
- **No Inter/Roboto**: Never fallback to system sans-serif. Use the provided variables: `--font-space` or `--font-mono`.

### 🚫 Code Slop (Technical Taboos)

- **No `any`**: TypeScript must be 100% sound. Define interfaces for every prop.
- **No Magic Numbers**: Animation durations, spring constants, and delays must be consistent. Use the `portfolioData` logic.
- **No Prop-Drilling**: Use the centralized `src/lib/data/` structure.
- **No Inline Styles**: Use Tailwind classes or CSS variables for dynamic colors.
- **No Generic Components**: Do not use `<div className="card">`. Use the `TechFrame` wrapper or custom geometric borders.
- **No Bare SVGs**: All decorative SVGs must be wrapped in `motion.div` or have defined `preserveAspectRatio`.

## 11. Mandatory Discovery Protocol

Before writing a single line of code, you must ensure you have the **Full Context**. Do not guess the existence of utility functions or component props.

1. **The Context Search Rule**: If you are asked to modify a file (e.g., `Archive.tsx`) and the corresponding data file (e.g., `archiveProjects.ts`) is not in your active context, **YOU MUST SEARCH FOR IT FIRST**.
2. **The Pattern Match Rule**: Before creating a new component, search `src/components/visuals/` to see how existing "Hardware Modules" are built. Match their SVG architecture.
3. **The Variable Check**: Always check `src/app/globals.css` for custom `@theme` variables before hardcoding hex values.

## 12. Summary of Restricted Rules (The "Golden Constraints")

| Category | Restricted Rule |
| :--- | :--- |
| **Workflow** | You must state: *"Searching documentation/files for [Name]..."* before coding. |
| **Animation** | Strictly use `framer-motion`. Prefer `spring` over `tween` for a "mechanical" feel. |
| **Layout** | Sections must be flush (`-my-1` or `pt/pb` only). No vertical gaps between circuit lines. |
| **Data** | Content must live in `src/lib/data/`. Components should only handle presentation. |
| **State** | Use `"use client"` only for micro-interactions. Keep the core page structure Server-Side. |
| **Identity** | Every component must have a "Hardware Accent" (corner bracket, screw, or tech-border). |

## 13. Execution Steps for New Features

1. **Analyze Registry**: Look at `components.json` for path aliases.
2. **Schema Verification**: Check `src/lib/data.ts` to see where the new data fits into the `portfolioData` object.
3. **Atomic Build**:
   - Create the Visual Module in `src/components/visuals/`.
   - Create the Section Wrapper in `src/components/sections/`.
   - Integrate the `TraceRouter` in `src/app/page.tsx` to maintain the unbroken circuit line.
4. **Telemetry Audit**: Ensure any new scroll-linked values are reflected in the `TelemetryNav` if applicable.

## 14. Escalation: When the HUD Breaks

If the vertical trace line (`GlobalTraceLine` or section traces) appears broken:

- **A gap that only appears while scrolling, and closes when you stop** is always smoothing applied before a clamp. Either the rail is not driven by `useTraceFill`, or a rail grew its own `useSpring` instead of reading the shared front. See the Trace Continuity Contract in §4.
- **The line stops short of the footer** means the front is capped at the viewport centre. Check that `traceFront()` still applies its end-of-page ramp and that `TraceField` is measuring `runway` (`scrollHeight - innerHeight`) rather than assuming it.
- **A gap that is there at rest** is geometry: the rail above does not end on the pixel where the next one starts. Rails must span `top-0 bottom-0` of a container whose box equals the section box, and stacked rails must share a column (`left-1/2 -translate-x-1/2`, or `left-[4rem]`).
- **A stall at a 90-degree corner is intentional.** The router entry drop is centre-tracked 1:1, then the front dwells ~31px on the junction box while the lateral run draws, and the exit drop runs ~1.5x to land exactly on the seam below. Retiming it (`CORNER`/`RUN` in `TraceRouters.tsx`) is fine; making the legs non-sequential is not, because that is what opens a real hole.
- Check if the parent section has `overflow-hidden` (it shouldn't, use `overflow-x-clip`).
- Check if the section has `relative` positioning.
- Ensure the `max-w-7xl` container has the correct `px-6 md:px-12` padding to align with the Navbar.

## 15. Performance & Optimization (The "Mach Speed" Rule)

High-fidelity HUDs with SVGs and Canvas can become sluggish. Maintain 60FPS at all costs.

- **SVG Optimization**: Complex SVG paths (planets, circuits) must use `vector-effect="non-scaling-stroke"` to maintain consistent line weights during scaling.
- **Canvas Lifecycle**: The `DeepSpaceEnvironment.tsx` uses `requestAnimationFrame`. Always ensure a cleanup function is present to `cancelAnimationFrame` on unmount to prevent memory leaks.
- **Component Memoization**: Use `React.memo` for static background visuals or heavy SVG components that do not rely on scroll state to prevent unnecessary re-renders.
- **Dynamic Imports**: For heavy visual modules (e.g., `GeometricJupiter.tsx`), use `next/dynamic` with `{ ssr: false }` to reduce initial bundle size and ensure hydration matches.

## 16. Accessibility (The "Readable HUD" Rule)

Technical aesthetics must not sacrifice usability. A true engineer builds for everyone.

- **ARIA for SVGs**: Decorative SVGs must have `aria-hidden="true"`. Interactive or data-driven SVGs must have a `<title>` tag and `role="img"`.
- **Motion Sensitivity**: Respect the user's system preferences. Use the `useReducedMotion` hook from Framer Motion to disable intense parallax or flashing for users who prefer reduced motion.
- **Contrast Ratios**: While the theme is dark (`#020617`), ensure text (`#F8FAFC` or `#94A3B8`) maintains high contrast against background elements.
- **Keyboard Navigation**: The `TelemetryNav` and `AdminTerminal` must be fully navigable via Tab and Enter.

## 17. Data Schema Integrity (The "Source of Truth" Rule)

Content is decoupled from UI. Follow the established schema in `src/lib/data/`.

- **Extending Data**: When adding a new project or journey item, you **must** update the corresponding file in `src/lib/data/` first.
- **Centralized Export**: All data must be funneled through `src/lib/data.ts` and exported via the `portfolioData` object to maintain a clean import path for components.
- **Strict Typing**: If the data structure changes, you must update the type definitions in the component's props to reflect the change. No loose objects.

## 18. Debugging & System Logs (The "Telemetry" Rule)

The HUD includes built-in developer Easter eggs. Maintain and respect them.

- **Console Art**: Do not remove the `useBootSequence.ts` hook. It handles the stylized ASCII art in the browser console.
- **HUD Diagnostics**: Use the `TelemetryNav` as a visual debugger. If `VELOCITY` or `ALTITUDE` is not updating, the scroll hook is disconnected.
- **Terminal Overrides**: The `AdminTerminal.tsx` is the primary "God Mode" interface. New hidden commands should be added to the `switch` statement in `handleCommand`.

## 19. Environment & Deployment (The "Orbital Stable" Rule)

This project is optimized for modern hosting environments (Netlify/Vercel).

- **Deployment Platform**: Primarily Netlify (as seen in `sitemap.ts`). Ensure `metadataBase` in `layout.tsx` matches the production URL.
- **SEO & Metadata**: Every page modification must check `layout.tsx` for OpenGraph and Twitter card integrity. Use the "Space Grotesk" aesthetic for OG images.
- **Robots & Sitemaps**: Dynamic routes (if added) must be reflected in `src/app/sitemap.ts` and `src/app/robots.ts`.

## 20. Final Validation Checklist

Before declaring a task "Complete," the agent must verify:

1. [ ] **Pixel-Perfect Alignment**: Does the UI line up with the `GlobalTraceLine`?
2. [ ] **Typographic Consistency**: Are all labels in `JetBrains Mono` and headers in `Space Grotesk`?
3. [ ] **Trace Continuity**: Scroll the full page. Is there exactly one lit data packet, sitting on the viewport centre line, with no hole at any section seam?
4. [ ] **Interactive Responsiveness**: Does the `TelemetryNav` menu close cleanly on mobile clicks?
5. [ ] **Color Fidelity**: Are we using `#F97316` for active states and `#3B82F6` for orbital/cold states?
6. [ ] **Code Cleanliness**: Is the code free of "AI Slop" (generic names, soft shadows, unnecessary divs)?

## 21. The Living Manifest Protocol (Self-Evolution)

**CRITICAL RULE:** This `Agents.md` is the project's "Long-Term Memory." To prevent context drift and ensure future agents operate with 100% accuracy, you MUST maintain this document.

### 🔄 When to Update Agents.md

- **Structural Shifts**: If you move directories or change the `src/` hierarchy.
- **New Hardware Patterns**: If you invent a new UI design pattern (e.g., a new type of "Hardware Screw" or "Telemetry Graph").
- **Data Schema Changes**: If you add new categories to `src/lib/data.ts`.
- **New Essential Commands**: If you add new scripts to `package.json` (e.g., for testing or deployment).
- **Reference Implementations**: If you build a particularly complex component that should serve as the "Gold Standard" for future work.
- **New Boundaries**: If you discover a "gotcha" or a "slop-pattern" that must be avoided in the future.

### 🛠️ How to Update

1. **Identify the Delta**: After completing a task, ask: *"Did I just change how this system works or looks?"*
2. **Execute the Update**: Modify the relevant section in `Agents.md` immediately. Do not wait for a prompt.
3. **Log the Version**: If a major architectural change occurs, update the **"Project Identity & Archetype"** section to reflect the new state.

### 📡 Inter-Agent Sync

You are not working in a vacuum. Assume every new session starts by reading this file. If you don't update it, the next agent will lack the "Telemetry" needed to maintain the HUD's precision. **Documenting the system is as important as building it.**

## 22. Pre-Task Discovery & Context Sync

Before executing any prompt, you must perform a **System Scan**:

1. **Verify `Agents.md`**: Is this the latest version? Does it reflect the current `Directory structure`?
2. **Scan `package.json`**: Check for new dependencies that might change the "Anti-Slop" rules (e.g., a new animation library).
3. **Map the Trace**: If adding a section, visually map where the `GlobalTraceLine` will enter and exit that section.
4. **Content Audit**: Check `src/lib/data/` to ensure you aren't hardcoding strings that should be modularized.

## 23. Summary of Absolute Authority

- **Style**: Aerospace / Industrial / HUD.
- **Code**: Strict TS / No Slop / Physics Motion.
- **Structure**: Flush Sections / Unbroken Trace Lines.
- **Maintenance**: `Agents.md` is a living document. **Update it or the system fails.**

System Status: ORBITAL_STABLE.
Agent Identity: FULLY_SYNCHRONIZED.
Ready for Mission Execution.
