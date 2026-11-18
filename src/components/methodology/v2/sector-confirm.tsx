"use client";

import { useState } from "react";
import { controlClass } from "@/components/landing/molecules/field";

export function SectorConfirm({
  brought,
  options,
  onConfirm,
}: {
  brought: string;
  options: { id: string; label: string }[];
  onConfirm: (id: string) => void;
}) {
  const [id, setId] = useState(options.length === 1 ? options[0].id : "");

  return (
    <section className="mx-auto grid w-full max-w-lg gap-6 px-4 py-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-wide text-brand uppercase">Tu sector</p>
        <h1 className="text-2xl font-semibold text-ink">Confirma el diagnóstico</h1>
        <p className="text-sm leading-relaxed text-ink-secondary">
          El de tu registro se queda. El diagnóstico usa uno de los que sí cubrimos.
        </p>
      </div>
      <div className="grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <article className="rounded-2xl border border-line bg-elevated p-4">
          <p className="text-xs font-semibold tracking-wide text-ink-secondary uppercase">Traías</p>
          <p className="mt-2 text-sm font-medium text-ink">{brought || "Sin sector"}</p>
        </article>
        <p className="self-center text-center text-sm font-semibold text-ink-secondary">vs</p>
        <article className="rounded-2xl border border-line bg-elevated p-4">
          <label className="grid gap-2" htmlFor="sector-diagnostico">
            <span className="text-xs font-semibold tracking-wide text-ink-secondary uppercase">El diagnóstico</span>
            <select
              id="sector-diagnostico"
              className={controlClass}
              value={id}
              onChange={(event) => setId(event.target.value)}
            >
              {options.length === 1 ? null : <option value="">Elige</option>}
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </article>
      </div>
      <button type="button" className="btn btn-primary" disabled={!id} onClick={() => id && onConfirm(id)}>
        Confirmar
      </button>
    </section>
  );
}
