"use client";

export default function GeometricJupiter() {
  return (
    <div className="absolute top-[5%] left-[-60%] md:left-[-45%] w-[180%] md:w-[140%] max-w-[2000px] aspect-square opacity-[0.15] pointer-events-none z-0">
      <svg viewBox="0 0 200 200" className="w-full h-full stroke-[#F97316] fill-none">
        <g transform="translate(100, 100) rotate(10)">
          <circle cx="0" cy="0" r="45" strokeWidth="0.4" className="stroke-slate-500" />
          <path d="M -39 -22 Q 0 -15 39 -22" strokeWidth="0.3" strokeDasharray="2 2" className="stroke-slate-400" />
          <path d="M -44 -8 Q 0 0 44 -8" strokeWidth="0.5" className="stroke-[#F97316]" />
          <path d="M -44 10 Q 0 18 44 10" strokeWidth="0.3" strokeDasharray="1 3" className="stroke-slate-400" />
          <path d="M -35 28 Q 0 35 35 28" strokeWidth="0.4" className="stroke-[#F97316]" />
          
          <g className="stroke-[#3B82F6] fill-[#020617]">
            <circle cx="0" cy="0" r="1.5" strokeWidth="0.5">
              <animate attributeName="cx" values="-70;-20;60;30;-40;-70" dur="25s" repeatCount="indefinite" />
              <animate attributeName="cy" values="-40;-60;-10;50;30;-40" dur="25s" repeatCount="indefinite" />
            </circle>
            
            <circle cx="0" cy="0" r="1" strokeWidth="0.5">
              <animate attributeName="cx" values="40;60;10;-50;-30;40" dur="18s" repeatCount="indefinite" />
              <animate attributeName="cy" values="20;-20;-40;-10;30;20" dur="18s" repeatCount="indefinite" />
            </circle>

            <circle cx="0" cy="0" r="2" strokeWidth="0.3" className="stroke-slate-400">
              <animate attributeName="cx" values="0;-80;-40;80;50;0" dur="35s" repeatCount="indefinite" />
              <animate attributeName="cy" values="70;20;-50;-30;40;70" dur="35s" repeatCount="indefinite" />
            </circle>
          </g>
        </g>
      </svg>
    </div>
  );
}
