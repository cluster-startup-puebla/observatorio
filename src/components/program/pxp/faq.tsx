"use client";

import { useState } from "react";
import { PxpFrame } from "./frame";

const items = [
  ["¿Qué es una necesidad tecnológica?", "Un reto concreto de la operación de tu empresa que podría resolverse con tecnología."],
  ["¿Cada cuánto se responde?", "Cada año o cada vez que tu empresa implementa una tecnología nueva."],
  ["¿Dónde se responde?", "Durante las sesiones o desde la cuenta de tu empresa en la plataforma."],
  ["¿Qué pasa después de declarar mi necesidad?", "Se suma a la estadística anónima del Observatorio. Con ella, startups y equipos de desarrollo construyen soluciones que se validan con empresas como la tuya."],
  ["¿Se publica el nombre de mi empresa o mi necesidad?", "No. Tu necesidad solo se usa como estadística anónima por sector. Por ejemplo, “el sector muebles necesita sistemas de trazabilidad”."],
  ["¿Qué son las empresas de innovación abierta (EIA)?", "Empresas que se abren a probar y co-crear soluciones con startups. Las que participan ganan ventaja competitiva."],
  ["¿Tiene costo?", "No. Participar es gratuito para las empresas."],
] as const;

export function PxpFaq() {
  const [open, setOpen] = useState(0);

  return (
    <PxpFrame id="faq" tone="sand">
      <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <h2 className="pxp-title text-ink lg:sticky lg:top-28">
          Preguntas frecuentes
        </h2>
        <div className="divide-y divide-line border-y border-line">
          {items.map(([question, answer], index) => {
            const shown = open === index;
            return (
              <div key={question}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-4 text-left font-display text-base font-bold text-ink lg:text-lg"
                  aria-expanded={shown}
                  onClick={() => setOpen(shown ? -1 : index)}
                >
                  {question}
                  <span aria-hidden>{shown ? "−" : "+"}</span>
                </button>
                <div
                  aria-hidden={!shown}
                  className={`grid motion-reduce:transition-none ${shown ? "grid-rows-[1fr] duration-500" : "grid-rows-[0fr] duration-300"} transition-[grid-template-rows] ease-[cubic-bezier(0.22,1,0.36,1)]`}
                >
                  <div className="overflow-hidden">
                    <p
                      className={`pxp-copy pb-4 text-ink-secondary motion-reduce:transition-none ${shown ? "translate-y-0 opacity-100 duration-500" : "translate-y-1 opacity-0 duration-200"} transition-[opacity,translate] ease-[cubic-bezier(0.22,1,0.36,1)]`}
                    >
                      {answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PxpFrame>
  );
}
