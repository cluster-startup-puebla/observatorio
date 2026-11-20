function HeroMark() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="h-[clamp(4.5rem,18vw,15rem)] w-auto shrink-0 text-white">
      <path d="M14 4 L86 96 M86 4 L14 96" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="square" />
    </svg>
  );
}

export function ProgramHero() {
  return (
    <section id="inicio" data-program-field className="scroll-mt-24 bg-program-field text-white">
      <div className="container-site flex flex-col pt-4 pb-12 lg:pt-6 lg:pb-16">
        <div className="relative pl-6">
          <span aria-hidden className="absolute top-1.5 bottom-0 left-0 w-px bg-white/70" />
          <span aria-hidden className="absolute top-1.5 left-0 size-1.5 -translate-x-1/2 rounded-full bg-white" />
          <p className="text-[0.72rem] font-medium tracking-[0.22em] uppercase">
            Levantamiento de necesidades tecnológicas
          </p>
          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-8">
            <h1 className="font-display text-[clamp(2.75rem,7vw,6.25rem)] leading-[0.88] font-bold tracking-[-0.03em]">
              Foro
              <br />
              Puebla
              <br />
              <span className="text-[#d865aa]">x</span> Puebla
            </h1>
            <HeroMark />
          </div>
          <p className="mt-6 text-[clamp(1rem,2vw,1.35rem)]">Observatorio Tecnológico de Puebla</p>
          <div aria-hidden className="relative mt-8 h-2">
            <span className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-white/70" />
            <span className="absolute top-1/2 left-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
            <span className="absolute top-1/2 right-0 size-1.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
          </div>
        </div>
      </div>
    </section>
  );
}
