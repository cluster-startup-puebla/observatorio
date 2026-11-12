"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { sessionOnLabel } from "@/lib/sessions/face";

const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234b5563' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

const selectClass =
  "h-9 w-80 max-w-full appearance-none rounded-lg border border-line bg-elevated bg-[length:1rem] bg-[position:right_0.75rem_center] bg-no-repeat pr-10 pl-3 text-small text-ink";

type Choice = {
  id: string;
  venue: string;
  sessionOn: string | null;
  current: boolean;
};

export function SessionSelect({ choices, selectedId }: { choices: Choice[]; selectedId: string | null }) {
  const initial = selectedId ?? choices.find((choice) => choice.current)?.id ?? choices[0]?.id ?? "";
  const [selected, setSelected] = useState(initial);
  if (choices.length < 2) return null;
  return (
    <form action="/admin" method="get" className="flex flex-wrap items-end gap-3">
      <label className="grid gap-1 text-small text-ink">
        Sesión
        <select
          name="sesion"
          value={selected}
          data-testid="tablero-sesion"
          className={selectClass}
          style={{ backgroundImage: chevron }}
          onChange={(event) => setSelected(event.target.value)}
        >
          {choices.map((choice) => (
            <option key={choice.id} value={choice.id}>
              {optionLabel(choice)}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" size="sm">
        Ver convocatoria
      </Button>
      <Button size="sm" variant="outline" asChild>
        <Link href={`/admin/sesiones/${selected}`}>Ver detalle</Link>
      </Button>
    </form>
  );
}

function optionLabel(choice: Choice) {
  const when = choice.sessionOn ? ` · ${sessionOnLabel(choice.sessionOn)}` : "";
  const current = choice.current ? " (vigente)" : "";
  return `${choice.venue}${when}${current}`;
}
