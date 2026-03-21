"use client";

export default function SystemWindowPlaceholder({ index, title }: { index: number; title: string }) {
  return (
    <div className="relative w-full h-full min-h-[300px] xl:min-h-[400px] bg-[#020617] border border-slate-800 flex flex-col group overflow-hidden transition-colors duration-500 hover:border-[#3B82F6]/50">
      <div className="h-8 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900/30">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-slate-700 border border-slate-600 group-hover:bg-red-500/50 transition-colors" />
          <div className="w-2 h-2 bg-slate-700 border border-slate-600 group-hover:bg-yellow-500/50 transition-colors delay-75" />
          <div className="w-2 h-2 bg-slate-700 border border-slate-600 group-hover:bg-emerald-500/50 transition-colors delay-150" />
        </div>
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest truncate">vis_module_0{index + 1}.exe</span>
      </div>
      <div className="flex-1 relative flex items-center justify-center bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-700 group-hover:border-[#3B82F6] transition-colors" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-700 group-hover:border-[#3B82F6] transition-colors" />
        <div className="flex flex-col items-center gap-2">
          <span className="text-slate-700 group-hover:text-[#3B82F6] font-mono text-xs uppercase tracking-widest transition-colors">[ AWAITING_VISUAL_PAYLOAD ]</span>
          <span className="text-slate-800 font-mono text-[9px] uppercase tracking-widest">TARGET: {title}</span>
        </div>
      </div>
    </div>
  );
}
