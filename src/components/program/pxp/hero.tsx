import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { companyAccountHref } from "@/content/landing";

function HeroMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      <path d="M14 4 L86 96 M86 4 L14 96" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="square" />
    </svg>
  );
}

export function PxpHero() {
  return (
    <section id="inicio" data-program-field className="relative -mt-20 flex min-h-svh scroll-mt-24 items-center bg-program-field pt-20 text-white">
      <HeroMark className="pointer-events-none absolute top-16 -right-10 h-72 w-auto text-white/20 lg:hidden" />
      <div className="relative mx-auto grid w-full max-w-[1200px] items-center gap-10 px-4 py-28 lg:grid-cols-[minmax(0,1fr)_auto] lg:py-32">
        <div className="relative pl-6">
          <span aria-hidden className="absolute top-1.5 bottom-0 left-0 w-px bg-white/70" />
          <span aria-hidden className="absolute top-1.5 left-0 size-1.5 -translate-x-1/2 rounded-full bg-white" />
          <p className="text-xs font-bold tracking-[0.18em] text-white uppercase">Levantamiento de necesidades tecnológicas</p>
          <h1 className="mt-4 text-[clamp(3.5rem,9vw,6.25rem)] leading-[0.88] font-extrabold tracking-[-0.03em]">
            Puebla
            <br />
            <span className="text-program-x">x</span> Puebla
          </h1>
          <p className="mt-6 max-w-[36ch] text-lg leading-snug">
            Dinos qué le falta a tu empresa en tecnología. Startups y equipos de desarrollo de Puebla construyen la solución, validada contigo.
          </p>
          <div className="mt-6 flex flex-col items-start gap-4">
            <Link href={companyAccountHref} className="btn w-full bg-white text-center text-program-field sm:w-fit">
              Crear cuenta y registrar mi necesidad
            </Link>
            <Link href="#como-funciona" className="inline-flex items-center gap-2 font-bold text-white">
              Ver cómo funciona
              <ArrowDown aria-hidden size={16} />
            </Link>
          </div>
          <p className="mt-6 max-w-[42ch] text-small text-white/90">
            Una iniciativa del Clúster de Startups e Innovación y el Observatorio Tecnológico de Puebla.
          </p>
          <div aria-hidden className="relative mt-8 h-2">
            <span className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-white/70" />
            <span className="absolute top-1/2 left-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
            <span className="absolute top-1/2 right-0 size-1.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
          </div>
        </div>
        <HeroMark className="hidden h-[clamp(8rem,22vw,18rem)] w-auto text-white lg:block" />
      </div>
    </section>
  );
}
