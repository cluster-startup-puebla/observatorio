import Link from "next/link";
import { ReadingToggle } from "@/components/diagnostico/reading-dock";
import { Kicker } from "@/components/landing/atoms/kicker";
import { diagnosticRegisterHref } from "@/content/diagnostico-tmec";

export function DocHero() {
  return (
      <header className="border-b border-line">
        <div className="container-site doc-wrap grid gap-6 py-10 sm:gap-8 sm:py-16 lg:py-24">
          <Kicker>Resumen ejecutivo · Octubre de 2026</Kicker>
          <div className="grid gap-4">
            <h1 className="max-w-4xl text-balance text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.98] font-bold tracking-[-0.03em] text-ink">
              Puebla ante el T-MEC
            </h1>
            <p className="text-body-lg max-w-3xl text-ink-secondary">
              Diagnóstico, retos, oportunidades y estrategia para posicionar, fortalecer y proteger
              la economía poblana.
            </p>
          </div>
          <div className="max-w-3xl border-l-2 border-brand pl-5">
            <p className="text-micro uppercase text-ink-muted">De quién es este análisis</p>
            <p className="text-h3 mt-2 text-ink">VIA Partners</p>
            <p className="mt-2 text-body text-ink-secondary">
              Elaborado para Puebla x Puebla. Corte al 16 de octubre de 2026.
            </p>
          </div>
          <div className="doc-hero-actions flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#definicion" className="btn btn-primary w-full sm:w-auto">
              Leer el resumen
            </a>
            <Link href={diagnosticRegisterHref} className="btn btn-secondary w-full sm:w-auto">
              Registrarme y descargar
            </Link>
            <ReadingToggle prominent />
          </div>
        </div>
      </header>
  );
}
