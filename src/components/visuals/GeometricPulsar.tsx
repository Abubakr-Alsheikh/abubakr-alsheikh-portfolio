"use client";

export default function GeometricPulsar() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] md:w-[150%] max-w-[2400px] aspect-square opacity-[0.08] pointer-events-none z-0">
      <svg viewBox="0 0 200 200" className="w-full h-full fill-none">
        <g transform="translate(100, 100)">
          <circle cx="0" cy="0" r="10" strokeWidth="1" className="stroke-[#3B82F6]" />
          <circle cx="0" cy="0" r="15" strokeWidth="0.5" strokeDasharray="1 2" className="stroke-[#F97316]" />
          
          <circle cx="0" cy="0" r="30" strokeWidth="0.2" className="stroke-[#3B82F6]">
            <animate attributeName="r" values="30;40;30" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;1;0.5" dur="4s" repeatCount="indefinite" />
          </circle>
          
          <circle cx="0" cy="0" r="50" strokeWidth="0.3" strokeDasharray="4 8" className="stroke-slate-500">
            <animateTransform 
              attributeName="transform" 
              type="rotate" 
              from="0 0 0" 
              to="360 0 0" 
              dur="30s" 
              repeatCount="indefinite" 
            />
            <animate attributeName="r" values="50;52.5;50" dur="30s" repeatCount="indefinite" />
          </circle>
          
          <circle cx="0" cy="0" r="75" strokeWidth="0.1" className="stroke-[#F97316]">
            <animate attributeName="r" values="75;80;75" dur="6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="6s" repeatCount="indefinite" />
          </circle>
          
          <circle cx="0" cy="0" r="95" strokeWidth="0.2" strokeDasharray="1 10" className="stroke-[#3B82F6]">
            <animateTransform 
              attributeName="transform" 
              type="rotate" 
              from="360 0 0" 
              to="0 0 0" 
              dur="60s" 
              repeatCount="indefinite" 
            />
          </circle>
        </g>
      </svg>
    </div>
  );
}
