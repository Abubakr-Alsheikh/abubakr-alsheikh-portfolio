import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  GitCommitHorizontal,
  Github,
  Globe,
} from "lucide-react";
import { topProjectsData, type TopProject } from "@/lib/data/topProjects";
import { caseStudiesData } from "@/lib/data/caseStudies";
import DeepSpaceEnvironment from "@/components/visuals/DeepSpaceEnvironment";
import CodeDiff from "@/components/visuals/CodeDiff";
import QaderVisual from "@/components/visuals/QaderVisual";
import MaxCLIVisual from "@/components/visuals/MaxCLIVisual";
import NanoMangaVisual from "@/components/visuals/NanoMangaVisual";
import SchoolManagementVisual from "@/components/visuals/SchoolManagementVisual";

/**
 * A featured project's case study. Content comes from `caseStudies.ts`, which
 * only states what the project's public sources back up; a project with no
 * entry has no page (`dynamicParams = false` turns it into a 404).
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(caseStudiesData).map((slug) => ({ slug }));
}

type Params = Promise<{ slug: string }>;

function find(slug: string) {
  const project = topProjectsData.find((p) => p.slug === slug);
  const study = caseStudiesData[slug];
  return project && study ? { project, study } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = find(slug);
  if (!found) return {};
  const { project, study } = found;
  return {
    title: `${project.title} · Case Study`,
    description: study.summary,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title: `${project.title} · Case Study`,
      description: study.summary,
      url: `/projects/${slug}`,
    },
  };
}

const VISUALS: Record<string, React.ComponentType> = {
  qader: QaderVisual,
  "max-cli": MaxCLIVisual,
  "nanomanga-studio": NanoMangaVisual,
  "school-management-system": SchoolManagementVisual,
};

const LINK =
  "flex items-center gap-2 px-4 h-9 border font-mono text-xs tracking-widest uppercase transition-colors group/link";
const ARROW =
  "w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform";

function Links({ project }: { project: TopProject }) {
  const { live, repo, docs } = project.links;
  return (
    <div className="flex flex-wrap gap-3">
      {live && (
        <a
          href={live}
          target="_blank"
          rel="noreferrer"
          className={`${LINK} bg-[#F97316]/10 border-[#F97316]/30 text-[#F97316] hover:bg-[#F97316] hover:text-[#020617]`}
        >
          <Globe className="w-3.5 h-3.5" />
          Live
          <ArrowUpRight className={ARROW} />
        </a>
      )}
      {repo && (
        <a
          href={repo}
          target="_blank"
          rel="noreferrer"
          className={`${LINK} bg-[#020617] border-slate-700 text-slate-300 hover:border-[#3B82F6] hover:text-[#3B82F6]`}
        >
          <Github className="w-3.5 h-3.5" />
          Source
          <ArrowUpRight className={ARROW} />
        </a>
      )}
      {docs && (
        <a
          href={docs}
          target="_blank"
          rel="noreferrer"
          className={`${LINK} bg-[#020617] border-slate-700 text-slate-300 hover:border-[#3B82F6] hover:text-[#3B82F6]`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Docs
          <ArrowUpRight className={ARROW} />
        </a>
      )}
    </div>
  );
}

/** Renders `backticked` runs in the data as inline code. */
function Prose({ text }: { text: string }) {
  return text.split("`").map((part, i) =>
    i % 2 === 1 ? (
      <code
        key={i}
        className="px-1 py-px border border-slate-800 bg-slate-900/60 text-[#3B82F6] text-[0.92em]"
      >
        {part}
      </code>
    ) : (
      part
    ),
  );
}

/** A numbered block hanging off the page's left rail. */
function Block({
  index,
  label,
  children,
}: {
  index: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative pl-8 md:pl-16">
      <span
        aria-hidden="true"
        className="absolute left-0 top-[7px] w-2 h-2 -translate-x-[3.5px] bg-[#020617] border border-[#3B82F6]"
      />
      <span
        aria-hidden="true"
        className="absolute left-0 top-[11px] w-6 md:w-12 h-px bg-[#3B82F6]/40"
      />
      <h2 className="font-mono text-xs tracking-widest uppercase text-[#3B82F6] mb-8">
        {String(index).padStart(2, "0")}{" // "}{label}
      </h2>
      {children}
    </section>
  );
}

export default async function CaseStudyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const found = find(slug);
  if (!found) notFound();
  const { project, study } = found;

  const Visual = VISUALS[slug];
  const featured = topProjectsData.filter((p) => caseStudiesData[p.slug]);
  const next = featured[(featured.indexOf(project) + 1) % featured.length];
  const commitUrl =
    project.code && project.links.repo
      ? `${project.links.repo}/commit/${project.code.commit}`
      : null;

  return (
    <main className="relative w-full min-h-screen overflow-x-clip selection:bg-[#3B82F6]/30 selection:text-[#3B82F6]">
      <DeepSpaceEnvironment />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12 pt-10 pb-32">
        {/* Top bar */}
        <nav className="flex items-center justify-between gap-4 mb-20 font-mono text-[10px] md:text-xs tracking-widest uppercase">
          <Link
            href="/#projects"
            data-hud-target="CASE.BACK"
            className="flex items-center gap-2 px-3 h-9 border border-slate-800 bg-[#020617] text-slate-300 hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors group/back"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover/back:-translate-x-0.5 transition-transform" />
            The_Arsenal
          </Link>
          <span className="text-slate-400">
            {project.id}{" // Case_Study"}
          </span>
        </nav>

        {/* Header */}
        <header className="mb-16 max-w-4xl">
          <p className="font-mono text-[10px] md:text-xs tracking-widest uppercase text-[#F97316] mb-6">
            {study.context}
          </p>
          <h1 className="font-space font-bold tracking-tighter leading-[0.9] text-slate-100 text-[clamp(2.75rem,8vw,6.5rem)] mb-8">
            {project.title}
          </h1>
          <p className="font-space text-xl md:text-2xl text-slate-300 leading-snug text-balance mb-10">
            {study.summary}
          </p>
          <Links project={project} />
        </header>

        {Visual && (
          <div
            aria-hidden="true"
            className="relative w-full mb-24 border border-slate-800"
          >
            <Visual />
          </div>
        )}

        {/* Body, hung off one rail */}
        <div className="relative flex flex-col gap-24">
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 bottom-0 w-px bg-slate-800"
          />

          <Block index={1} label="Problem">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
              <p className="font-mono text-sm md:text-base leading-relaxed text-slate-300">
                <Prose text={study.problem} />
              </p>
              <dl className="grid grid-cols-2 border border-slate-800 bg-[#020617]">
                {study.facts.map((fact, i) => (
                  <div
                    key={fact.label}
                    className={`flex flex-col-reverse justify-end p-5 border-slate-800 ${i % 2 === 0 ? "border-r" : ""} ${
                      i < study.facts.length - 2 ? "border-b" : ""
                    } ${study.facts.length % 2 === 1 && i === study.facts.length - 1 ? "col-span-2 border-r-0" : ""}`}
                  >
                    {/* dt first for readers; flex-col-reverse puts the figure on top. */}
                    <dt className="mt-2 font-mono text-[10px] tracking-widest uppercase text-slate-400">
                      {fact.label}
                    </dt>
                    <dd className="font-space font-bold tracking-tighter text-4xl text-slate-100 leading-none">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Block>

          <Block index={2} label="Architecture">
            <ol className="border border-slate-800 bg-[#020617] divide-y divide-slate-800">
              {study.architecture.map((layer, i) => (
                <li
                  key={layer.name}
                  className="grid gap-2 md:grid-cols-[3rem_14rem_minmax(0,1fr)] md:gap-6 px-5 py-5 md:items-baseline"
                >
                  <span className="font-mono text-[10px] tracking-widest text-slate-400">
                    L{i + 1}
                  </span>
                  <span className="font-mono text-sm text-[#3B82F6]">
                    {layer.name}
                  </span>
                  <span className="font-mono text-sm leading-relaxed text-slate-300">
                    <Prose text={layer.detail} />
                  </span>
                </li>
              ))}
            </ol>
          </Block>

          <Block index={3} label="Key_Decisions">
            <div className="grid gap-4 md:grid-cols-2">
              {study.decisions.map((d, i) => (
                <article
                  key={d.title}
                  className="relative border border-slate-800 bg-[#020617] p-6 md:p-7"
                >
                  <span aria-hidden="true" className="absolute top-2 left-2 w-1 h-1 bg-slate-800" />
                  <span aria-hidden="true" className="absolute bottom-2 right-2 w-1 h-1 bg-slate-800" />
                  <p className="font-mono text-[10px] tracking-widest text-[#F97316] mb-4">
                    D.{String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-space text-xl md:text-2xl font-bold tracking-tight text-slate-100 mb-3">
                    {d.title}
                  </h3>
                  <p className="font-mono text-sm leading-relaxed text-slate-300">
                    <Prose text={d.body} />
                  </p>
                </article>
              ))}
            </div>
          </Block>

          {project.code && (
            <Block index={4} label="From_The_Source">
              <div className="max-w-3xl">
                <CodeDiff
                  file={project.code.file}
                  commit={project.code.commit}
                  lines={project.code.lines}
                />
                {commitUrl && (
                  <a
                    href={commitUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="-mt-6 inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase text-slate-400 hover:text-[#3B82F6] transition-colors"
                  >
                    <GitCommitHorizontal className="w-4 h-4" />
                    View commit {project.code.commit}
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            </Block>
          )}

          <Block index={project.code ? 5 : 4} label="Stack">
            <ul className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <li
                  key={tech}
                  className="px-3 py-1.5 border border-slate-800 bg-[#020617] font-mono text-xs tracking-widest uppercase text-slate-300"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </Block>
        </div>

        {/* Next */}
        {next && next.slug !== project.slug && (
          <Link
            href={`/projects/${next.slug}`}
            data-hud-target="CASE.NEXT"
            className="mt-32 flex items-end justify-between gap-6 border-t border-slate-800 pt-8 group/next"
          >
            <span className="flex flex-col gap-3">
              <span className="font-mono text-[10px] tracking-widest uppercase text-slate-400">
                {"Next // "}{next.id}
              </span>
              <span className="font-space font-bold tracking-tighter text-3xl md:text-5xl text-slate-100 group-hover/next:text-[#3B82F6] transition-colors">
                {next.title}
              </span>
            </span>
            <ArrowUpRight className="w-8 h-8 text-slate-400 group-hover/next:text-[#3B82F6] group-hover/next:translate-x-1 group-hover/next:-translate-y-1 transition-all shrink-0" />
          </Link>
        )}
      </div>
    </main>
  );
}
