const CURVE = "M12 90 C44 90 70 78 96 58 C122 38 140 16 164 16 C190 16 206 40 228 58 C252 78 278 90 308 90";

export function SectorRank() {
  return (
    <section className="space-y-3">
      <p className="text-xs font-semibold tracking-wide text-brand uppercase">El sector</p>
      <h2 className="text-base font-semibold text-ink">Tu lugar en el sector</h2>
      <div className="rounded-2xl border border-line bg-elevated px-4 pt-4 pb-4">
        <div className="pointer-events-none select-none" aria-hidden>
          <Curve />
        </div>
        <div className="mt-1 flex justify-between text-[11px] font-medium text-ink-secondary" aria-hidden>
          <span>Atrás</span>
          <span>Adelante</span>
        </div>
        <p className="mx-auto mt-4 max-w-[28ch] text-center text-sm leading-relaxed text-ink">
          Aún no hay información suficiente para mostrarte tu lugar en tu sector.
        </p>
      </div>
    </section>
  );
}

function Curve() {
  return (
    <svg viewBox="0 0 320 112" className="h-32 w-full" role="presentation">
      <defs>
        <linearGradient id="sector-place" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(6 76% 50%)" />
          <stop offset="48%" stopColor="hsl(42 84% 50%)" />
          <stop offset="100%" stopColor="hsl(146 58% 40%)" />
        </linearGradient>
        <filter id="sector-hide" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4.2" />
        </filter>
      </defs>
      <path d={`${CURVE} L308 98 L12 98 Z`} fill="url(#sector-place)" opacity="0.55" />
      <path d={CURVE} fill="none" stroke="url(#sector-place)" strokeWidth="3" strokeLinecap="round" />
      <g filter="url(#sector-hide)">
        <line x1="206" y1="24" x2="206" y2="94" stroke="var(--text-primary)" strokeWidth="1.5" />
        <circle cx="206" cy="40" r="6" fill="var(--bg-elevated)" stroke="var(--text-primary)" strokeWidth="2.5" />
      </g>
    </svg>
  );
}
