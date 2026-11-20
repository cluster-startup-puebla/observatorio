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
        <h2 className="text-[clamp(2rem,4vw,3rem)] leading-tight font-extrabold text-ink lg:sticky lg:top-28">
          Preguntas frecuentes
        </h2>
        <div className="divide-y divide-line border-y border-line">
          {items.map(([question, answer], index) => {
            const shown = open === index;
            return (
              <div key={question}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-4 text-left text-body font-bold text-ink"
                  aria-expanded={shown}
                  onClick={() => setOpen(shown ? -1 : index)}
                >
                  {question}
                  <span aria-hidden>{shown ? "−" : "+"}</span>
                </button>
                {shown ? <p className="pb-4 text-body text-ink-secondary">{answer}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </PxpFrame>
  );
}
