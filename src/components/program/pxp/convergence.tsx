"use client";

import { Reveal } from "./reveal";
import { PxpFrame } from "./frame";
import { PxpHeading } from "./heading";

export function PxpConvergence() {
  return (
    <PxpFrame id="programa" tone="sand">
      <Reveal>
        <PxpHeading eyebrow="La convergencia" title="Puebla x Puebla" />
        <p className="mt-6 max-w-[48ch] text-body text-ink">
          Hoy la industria local y las startups no se encuentran. El programa las acerca.
        </p>
        <div className="mt-14 flex flex-col items-center gap-8 lg:flex-row lg:justify-center lg:gap-6">
          <Side label="Hoy" title="Industria local" text="Hoy, sin soluciones a sus problemas específicos." />
          <Arrow />
          <Center />
          <Arrow />
          <Side label="Hoy" title="Startups" text="Hoy, construyen ideas sin validación." pale />
        </div>
      </Reveal>
    </PxpFrame>
  );
}

function Side({ label, title, text, pale = false }: { label: string; title: string; text: string; pale?: boolean }) {
  return (
    <div className="grid justify-items-center gap-3 text-center">
      <p className="text-xs font-bold tracking-[0.16em] text-ink-muted uppercase">{label}</p>
      <div className={`grid size-40 place-items-center rounded-full border border-dashed px-4 ${pale ? "border-program-x bg-program-x/40" : "border-line bg-surface"}`}>
        <p className="text-small font-bold text-ink">{title}</p>
      </div>
      <p className="max-w-[16ch] text-small text-ink-secondary">{text}</p>
    </div>
  );
}

function Arrow() {
  return <span aria-hidden className="text-2xl text-ink-muted lg:rotate-0 rotate-90">→</span>;
}

function Center() {
  return (
    <div className="grid justify-items-center gap-4 text-center">
      <p className="text-xs font-bold tracking-[0.16em] text-program-field uppercase">Con Puebla x Puebla</p>
      <div className="relative h-44 w-72">
        <span className="absolute top-0 left-0 grid h-40 w-40 place-items-center rounded-full bg-navy px-4 text-center text-small font-bold text-white">
          Empresas
          <span className="mt-1 block text-[0.7rem] font-normal">con las de innovación abierta, EIA</span>
        </span>
        <span className="absolute top-0 right-0 grid h-40 w-40 place-items-center rounded-full bg-program-field px-4 text-center text-small font-bold text-white">
          Startups B2B
        </span>
      </div>
      <p className="text-small font-bold tracking-[0.14em] text-ink uppercase">↑ Desarrollo regional</p>
    </div>
  );
}
