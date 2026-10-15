"use client";

import { motion } from "framer-motion";
import {
  Activity,
  AppWindow,
  ArrowRight,
  ArrowUpRight,
  Globe,
  Languages,
  Rocket,
  Server,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { WarpLink } from "@/components/shared/PageTransition";
import { useLenisInstance } from "@/components/shared/LenisProvider";
import TracePacket from "@/components/shared/TracePacket";
import { useTraceFill } from "@/hooks/useTraceFill";
import type {
  Service,
  ServiceIcon,
  ServiceProof,
  ServicesContent,
} from "@/lib/data/services";
import { servicesData } from "@/lib/data/services";

const ICONS: Record<ServiceIcon, LucideIcon> = {
  app: AppWindow,
  api: Server,
  site: Globe,
  ai: Sparkles,
  ops: Activity,
};

const pad = (n: number) => String(n).padStart(2, "0");

type View = "business" | "technical";

const CHIP =
  "inline-flex items-center gap-1 px-2 h-6 border border-slate-800 text-[10px] font-mono uppercase tracking-widest text-slate-300 hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors group/chip";

/**
 * Writes a starter message into the contact form and brings the visitor to
 * it. The form's textarea is uncontrolled (the terminal agent fills it the
 * same way), and the scroll goes through Lenis so it does not fight the
 * page's own smoothing.
 */
function useQuote() {
  const lenis = useLenisInstance();
  return (service: string) => {
    const field = document.getElementById("contact-message");
    if (!(field instanceof HTMLTextAreaElement)) return;
    field.value = servicesData.quote.message(service);
    const focus = () => {
      field.focus({ preventScroll: true });
      field.setSelectionRange(field.value.length, field.value.length);
    };
    if (lenis) {
      lenis.scrollTo(field, { offset: -window.innerHeight / 3, onComplete: focus });
    } else {
      field.scrollIntoView({ block: "center" });
      focus();
    }
  };
}

/** A case study opens through the blast doors; an anchor scrolls the page. */
function ProofLink({ proof }: { proof: ServiceProof }) {
  const lenis = useLenisInstance();
  if (proof.href.startsWith("/projects/")) {
    return (
      <WarpLink
        href={proof.href}
        warp={{ kicker: "Proof // Case_Study", title: proof.label }}
        className={CHIP}
      >
        {proof.label}
        <ArrowUpRight className="w-3 h-3 group-hover/chip:translate-x-0.5 group-hover/chip:-translate-y-0.5 transition-transform" />
      </WarpLink>
    );
  }
  return (
    <a
      href={proof.href}
      onClick={(e) => {
        const target = document.querySelector(proof.href);
        if (!lenis || !(target instanceof HTMLElement)) return;
        e.preventDefault();
        lenis.scrollTo(target);
      }}
      className={CHIP}
    >
      {proof.label}
      <ArrowRight className="w-3 h-3 group-hover/chip:translate-x-0.5 transition-transform" />
    </a>
  );
}

function ServiceCard({
  service,
  index,
  view,
  onQuote,
  quote,
}: {
  service: Service;
  index: number;
  view: View;
  onQuote: (title: string) => void;
  quote: ServicesContent["quote"];
}) {
  const Icon = ICONS[service.icon];
  const copy = view === "technical" ? service.technical : service;
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", damping: 30, stiffness: 220, delay: index * 0.05 }}
      data-hud-target={service.id}
      className="group relative flex flex-col bg-[#020617] border border-slate-800 hover:border-[#F97316]/60 transition-colors duration-300"
    >
      <div className="absolute top-1 left-1 w-1 h-1 bg-slate-800 group-hover:bg-[#F97316]" />
      <div className="absolute bottom-1 right-1 w-1 h-1 bg-slate-800 group-hover:bg-[#F97316]" />

      <div className="flex items-center justify-between px-5 md:px-6 h-11 border-b border-slate-800">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#F97316]">
          {service.id}
        </span>
        <Icon className="w-4 h-4 text-slate-400 group-hover:text-[#F97316] transition-colors" />
      </div>

      <div className="flex flex-col gap-5 p-5 md:p-6 flex-1">
        <div className="flex flex-col gap-3">
          <h3 className="text-xl md:text-2xl font-space font-bold text-slate-100 tracking-tight leading-tight">
            {service.title}
          </h3>
          <motion.p
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="text-sm font-mono text-slate-400 leading-relaxed"
          >
            {copy.summary}
          </motion.p>
        </div>

        <ul key={view} className="flex flex-col gap-2">
          {copy.includes.map((item) => (
            <li key={item} className="flex items-start gap-3 text-xs font-mono text-slate-300">
              <span
                className={`mt-1.5 w-1 h-1 shrink-0 ${view === "technical" ? "bg-[#F97316]" : "bg-[#3B82F6]"}`}
              />
              {item}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-2 mt-auto">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mr-1">
            Proof {"//"}
          </span>
          {service.proof.map((p) => (
            <ProofLink key={p.label} proof={p} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 px-5 md:px-6 py-4 border-t border-slate-800">
        <div className="flex flex-col gap-0.5 font-mono">
          <span className="text-[9px] uppercase tracking-widest text-slate-400">
            {service.startingAt ? "From" : "Pricing"}
          </span>
          <span className={service.startingAt ? "text-lg text-slate-100" : "text-xs text-slate-300"}>
            {service.startingAt ?? quote.unpriced}
          </span>
          {service.timeline && (
            <span className="text-[10px] text-slate-400">{service.timeline}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onQuote(service.title)}
          data-hud-target={`${service.id}.QUOTE`}
          className="shrink-0 flex items-center gap-2 h-9 px-3 border border-[#F97316]/60 text-[10px] font-mono uppercase tracking-widest text-[#F97316] hover:bg-[#F97316]/10 transition-colors group/quote"
        >
          {quote.action}
          <ArrowRight className="w-3 h-3 group-hover/quote:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.article>
  );
}

export default function Services({ data }: { data: ServicesContent }) {
  const traceRef = useRef<HTMLDivElement>(null);
  const { fill, packetOpacity } = useTraceFill(traceRef);
  const requestQuote = useQuote();
  const [view, setView] = useState<View>("business");

  return (
    <section id="services" className="relative w-full flex justify-center z-20 overflow-x-clip">
      <div className="w-full max-w-7xl relative pt-32 pb-32 px-6 md:px-12 flex flex-col">
        <div
          ref={traceRef}
          className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800/50 hidden md:block -translate-x-1/2 z-0"
        >
          <motion.div
            style={{ height: fill }}
            className="w-full bg-[#F97316] origin-top relative shadow-[0_0_15px_#F97316]"
          >
            <TracePacket opacity={packetOpacity} label="SERVICES" tone="orange" />
          </motion.div>
        </div>

        {/* Header on the right of the rail; the Engine's sits on the left. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 mb-16 w-full md:w-1/2 md:ml-auto md:pl-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Rocket className="w-5 h-5 text-[#F97316]" />
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              {data.kicker}
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-space font-bold text-slate-100 tracking-tighter leading-[1] mb-6">
            {data.titleLead} <span className="text-slate-500">{data.titleTrail}</span>
          </h2>
          <p className="text-sm md:text-base font-mono text-slate-400 leading-relaxed max-w-lg">
            {data.intro}
          </p>
        </motion.div>

        {/* Arabic-first: the one thing most of the market cannot do well. */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          data-hud-target="SVC.ARABIC"
          className="relative z-10 mb-6 grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-8 p-5 md:p-6 bg-[#020617] border border-[#3B82F6]/40"
        >
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#3B82F6]" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#F97316]" />
          <span className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-[#60A5FA]">
            <Languages className="w-4 h-4" />
            {data.arabicFirst.label}
          </span>
          <p className="text-sm font-mono text-slate-300 leading-relaxed">{data.arabicFirst.body}</p>
          <span
            lang="ar"
            dir="rtl"
            aria-hidden="true"
            className="hidden md:block text-3xl font-bold text-slate-100 whitespace-nowrap"
          >
            عربي أولاً
          </span>
        </motion.div>

        {/* One set of packages, read two ways: plain outcomes for a client,
            the stack and patterns for an engineer. */}
        <div className="relative z-10 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div
            role="group"
            aria-label="Read the packages as"
            data-hud-target="SVC.VIEW"
            className="flex border border-slate-800 bg-[#020617]"
          >
            {(["business", "technical"] as const).map((v) => {
              const on = view === v;
              return (
                <button
                  key={v}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setView(v)}
                  className={`h-9 px-4 text-[10px] font-mono uppercase tracking-widest transition-colors ${
                    on
                      ? "bg-[#F97316]/10 text-[#F97316] shadow-[inset_0_-2px_0_#F97316]"
                      : "text-slate-400 hover:text-[#3B82F6]"
                  }`}
                >
                  {data.views[v]}
                </button>
              );
            })}
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            {data.views.hint}
          </span>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {data.services.map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={i}
              view={view}
              onQuote={requestQuote}
              quote={data.quote}
            />
          ))}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            data-hud-target="SVC.CUSTOM"
            className="relative flex flex-col justify-between gap-6 p-5 md:p-6 border border-dashed border-slate-700 bg-[#020617]/80"
          >
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                SVC.{pad(data.services.length + 1)} {"//"} Custom brief
              </span>
              <h3 className="text-xl md:text-2xl font-space font-bold text-slate-100 tracking-tight">
                {data.custom.title}
              </h3>
              <p className="text-sm font-mono text-slate-400 leading-relaxed">{data.custom.body}</p>
            </div>
            <button
              type="button"
              onClick={() => requestQuote("a custom project")}
              className="self-start flex items-center gap-2 h-9 px-3 border border-slate-600 text-[10px] font-mono uppercase tracking-widest text-slate-200 hover:border-[#F97316] hover:text-[#F97316] transition-colors group/quote"
            >
              {data.custom.action}
              <ArrowRight className="w-3 h-3 group-hover/quote:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* How an engagement runs, so "Get a quote" is not a leap in the dark. */}
        <div className="relative z-10 mt-16">
          <span className="block mb-6 text-xs font-mono uppercase tracking-widest text-[#3B82F6]">
            Flight Plan // How a project runs
          </span>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-slate-800 bg-[#020617]">
            {data.process.map((step, i) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                data-hud-target={`FLOW.${pad(i + 1)}`}
                className="relative flex flex-col gap-2 p-5 md:p-6 border-slate-800 border-b sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <span className="text-[10px] font-mono tracking-widest text-[#F97316]">
                  {pad(i + 1)}
                </span>
                <span className="text-lg font-space font-bold text-slate-100">{step.title}</span>
                <p className="text-xs font-mono text-slate-400 leading-relaxed">{step.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
