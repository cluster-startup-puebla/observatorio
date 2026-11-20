export function HeroMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      <path d="M12 2 L88 98 M88 2 L12 98" fill="none" stroke="currentColor" strokeWidth="22" strokeLinecap="square" />
    </svg>
  );
}
