"use client";

export default function GeometricNeptune() {
  return (
    <div className="absolute bottom-[-10%] right-[-60%] md:right-[-40%] w-[200%] md:w-[150%] max-w-[2400px] aspect-square opacity-[0.25] pointer-events-none z-0">
      <svg viewBox="0 0 200 200" className="w-full h-full stroke-[#3B82F6] fill-none">
        <g transform="translate(100, 100)">
          <circle cx="0" cy="0" r="25" strokeWidth="0.5" className="stroke-slate-500" />
          <circle cx="0" cy="0" r="20" strokeWidth="0.2" className="stroke-slate-400" strokeDasharray="2 2" />

          <g transform="rotate(70)">
            <ellipse cx="0" cy="0" rx="80" ry="15" strokeWidth="0.4" className="stroke-[#3B82F6]">
              <animateTransform 
                attributeName="transform" 
                type="rotate" 
                from="0 0 0" 
                to="360 0 0" 
                dur="200s" 
                repeatCount="indefinite" 
              />
            </ellipse>
            <circle cx="80" cy="0" r="1.5" className="fill-[#3B82F6]">
              <animateTransform 
                attributeName="transform" 
                type="rotate" 
                from="0 0 0" 
                to="-360 0 0" 
                dur="200s" 
                repeatCount="indefinite" 
              />
            </circle>
          </g>

          <g transform="rotate(-20)">
            <ellipse cx="0" cy="0" rx="95" ry="20" strokeWidth="0.3" strokeDasharray="1 4" className="stroke-[#3B82F6]">
              <animateTransform 
                attributeName="transform" 
                type="rotate" 
                from="360 0 0" 
                to="0 0 0" 
                dur="250s" 
                repeatCount="indefinite" 
              />
            </ellipse>
          </g>

          <g transform="rotate(-50)">
            <ellipse cx="0" cy="0" rx="60" ry="10" strokeWidth="0.5" className="stroke-slate-600">
              <animateTransform 
                attributeName="transform" 
                type="rotate" 
                from="0 0 0" 
                to="360 0 0" 
                dur="150s" 
                repeatCount="indefinite" 
              />
            </ellipse>
          </g>
        </g>
      </svg>
    </div>
  );
}
