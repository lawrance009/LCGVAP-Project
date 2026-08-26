import { MapPin, ShieldCheck } from 'lucide-react';

const AnimatedGlobe = ({
  className = '',
  idPrefix = 'vc-globe',
  showLabels = true,
}) => {
  const titleId = `${idPrefix}-title`;
  const coreId = `${idPrefix}-core`;
  const arcId = `${idPrefix}-arc`;

  return (
    <div
      className={`relative mx-auto aspect-square w-full max-w-[420px] ${className}`}
      aria-label={showLabels ? 'Animated connection between Liberia and Cyprus' : undefined}
      aria-hidden={showLabels ? undefined : true}
    >
    <style>
      {`
        @keyframes vc-globe-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes vc-orbit-drift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.76; }
          50% { transform: translate3d(10px, -8px, 0) scale(1.04); opacity: 1; }
        }

        @keyframes vc-arc-flow {
          to { stroke-dashoffset: -140; }
        }

        .vc-globe-spin {
          transform-origin: center;
          animation: vc-globe-spin 42s linear infinite;
        }

        .vc-orbit-drift {
          animation: vc-orbit-drift 5.5s ease-in-out infinite;
        }

        .vc-arc-flow {
          stroke-dasharray: 12 14;
          animation: vc-arc-flow 5s linear infinite;
        }
      `}
    </style>

    <div className="absolute inset-8 rounded-full bg-indigo-500/10 blur-3xl" aria-hidden="true" />
    <div className="absolute left-12 top-16 h-28 w-28 rounded-full bg-red-500/10 blur-3xl" aria-hidden="true" />
    <div className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.04] shadow-2xl shadow-indigo-950/40" aria-hidden="true" />

    <svg
      viewBox="0 0 420 420"
      role={showLabels ? 'img' : undefined}
      aria-labelledby={showLabels ? titleId : undefined}
      className="relative h-full w-full overflow-visible"
    >
      {showLabels && <title id={titleId}>VCLGC alumni connection globe</title>}

      <defs>
        <radialGradient id={coreId} cx="36%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.28" />
          <stop offset="58%" stopColor="#312e81" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#111827" stopOpacity="0.04" />
        </radialGradient>
        <linearGradient id={arcId} x1="95" y1="240" x2="295" y2="150">
          <stop stopColor="#fca5a5" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>

      <circle cx="210" cy="210" r="155" fill={`url(#${coreId})`} stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
      <circle cx="210" cy="210" r="128" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
      <circle cx="210" cy="210" r="82" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      <g className="vc-globe-spin">
        <ellipse cx="210" cy="210" rx="155" ry="42" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
        <ellipse cx="210" cy="210" rx="155" ry="78" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <ellipse cx="210" cy="210" rx="42" ry="155" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
        <ellipse cx="210" cy="210" rx="82" ry="155" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
        <path d="M72 210H348" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <path d="M210 56V364" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      </g>

      <path
        d="M126 244C160 164 239 135 294 164"
        fill="none"
        stroke={`url(#${arcId})`}
        strokeWidth="3"
        strokeLinecap="round"
        className="vc-arc-flow"
      />
      <path
        d="M126 244C160 164 239 135 294 164"
        fill="none"
        stroke="rgba(199,210,254,0.22)"
        strokeWidth="12"
        strokeLinecap="round"
      />

      <g className="vc-orbit-drift">
        <circle cx="126" cy="244" r="8" fill="#fca5a5" />
        <circle cx="126" cy="244" r="20" fill="none" stroke="rgba(248,113,113,0.4)" strokeWidth="1.5" />
      </g>
      <g className="vc-orbit-drift" style={{ animationDelay: '1.4s' }}>
        <circle cx="294" cy="164" r="8" fill="#ffffff" />
        <circle cx="294" cy="164" r="20" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      </g>

      <g opacity="0.8">
        <circle cx="184" cy="260" r="3" fill="#a5b4fc" />
        <circle cx="242" cy="228" r="2.5" fill="#c7d2fe" />
        <circle cx="170" cy="176" r="2" fill="#818cf8" />
        <circle cx="260" cy="290" r="2.5" fill="#e0e7ff" />
      </g>
    </svg>

    {showLabels && (
      <>
        <div className="absolute left-[15%] top-[56%] flex items-center gap-2 rounded-md border border-white/12 bg-indigo-950/65 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
          <MapPin className="h-3.5 w-3.5 text-red-300" aria-hidden="true" />
          Liberia
        </div>
        <div className="absolute right-[12%] top-[31%] flex items-center gap-2 rounded-md border border-white/12 bg-indigo-950/65 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
          <MapPin className="h-3.5 w-3.5 text-indigo-200" aria-hidden="true" />
          Cyprus
        </div>
        <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/86 backdrop-blur">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-200" aria-hidden="true" />
          Verified connection
        </div>
      </>
    )}
    </div>
  );
};

export default AnimatedGlobe;
