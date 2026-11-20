"use client";

import { useState } from "react";
import { CompanyCta, DurationPill } from "./bits";
import { PxpFrame } from "./frame";
import { PxpHeading } from "./heading";

const stages = [
  {
    n: "01",
    title: "Levantamiento de necesidades",
    body: "Sesiones de escucha con la industria, sector por sector. Las empresas expresan sus necesidades y requisitos técnicos reales. Buscamos las brechas profundas: los problemas que el mercado no resuelve.",
    time: "2 meses de trabajo",
  },
  {
    n: "02",
    title: "El Observatorio",
    body: "El reporte vivo, público y compartido de la demanda tecnológica del estado. Convierte lo escuchado en inteligencia económica.",
    time: "20 días de trabajo",
  },
  {
    n: "03",
    title: "Prototipado (MVP)",
    body: "Startups y empresas de innovación abierta desarrollan y validan soluciones a necesidades reales, con el mercado real.",
    time: "5 meses",
  },
];

export function PxpStages() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <PxpFrame id="como-funciona">
      <PxpHeading eyebrow="Cómo funciona" title="De la necesidad a la solución, en tres etapas" />
      <ol className="mt-14 grid gap-10 lg:grid-cols-3 lg:gap-8" onMouseLeave={() => setActive(null)}>
        {stages.map((stage) => (
          <li
            key={stage.n}
            onMouseEnter={() => setActive(stage.n)}
            onFocus={() => setActive(stage.n)}
            className={`relative border-l border-program-field pl-6 transition lg:border-t lg:border-l-0 lg:pt-6 lg:pl-0 ${active && active !== stage.n ? "opacity-40" : ""}`}
          >
            <span aria-hidden className="absolute -top-3 left-0 hidden size-2.5 -translate-y-1/2 rounded-full bg-program-field lg:block" />
            <p className="font-serif text-6xl text-program-x">{stage.n}</p>
            <p className="text-xs font-bold tracking-[0.16em] text-program-field uppercase">Etapa {stage.n}</p>
            <h3 className="mt-2 text-h3 text-ink">{stage.title}</h3>
            <p className="mt-3 text-body text-ink-secondary">{stage.body}</p>
            <div className="mt-5">
              <DurationPill>{stage.time}</DurationPill>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-12">
        <CompanyCta>Crear cuenta y registrar mi necesidad</CompanyCta>
      </div>
    </PxpFrame>
  );
}
