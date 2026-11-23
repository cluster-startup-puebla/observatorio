"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  sessionChevron,
  sessionFilterShell,
  sessionSelectClass,
} from "@/components/admin/session-filter-styles";
import { Button } from "@/components/ui/button";
import { sessionOnLabel } from "@/lib/sessions/face";
import type { SessionChoice } from "@/lib/admin/tablero/session-choices";

export function SessionSelect({ choices, selectedId }: { choices: SessionChoice[]; selectedId: string | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const initial = selectedId ?? choices.find((choice) => choice.current)?.id ?? choices[0]?.id ?? "";
  const [selected, setSelected] = useState(initial);
  if (choices.length === 0) return null;

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    start(() => router.push(`/admin?sesion=${selected}`));
  }

  return (
    <form onSubmit={apply} className={sessionFilterShell}>
      <label className="grid min-w-0 flex-1 gap-1.5 text-small font-medium text-ink">
        Sesión
        <select
          name="sesion"
          value={selected}
          disabled={pending}
          data-testid="tablero-sesion"
          className={sessionSelectClass}
          style={{ backgroundImage: sessionChevron }}
          onChange={(event) => setSelected(event.target.value)}
        >
          {choices.map((choice) => (
            <option key={choice.id} value={choice.id}>
              {optionLabel(choice)}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="lg" disabled={pending} className="min-w-[10.5rem] rounded-full px-4">
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {pending ? "Cargando…" : "Ver convocatoria"}
        </Button>
        <Button size="lg" variant="outline" className="rounded-full px-4" asChild>
          <Link href={`/admin/sesiones/${selected}`} aria-disabled={pending}>
            Ver detalle
          </Link>
        </Button>
      </div>
    </form>
  );
}

function optionLabel(choice: SessionChoice) {
  const when = choice.sessionOn ? ` · ${sessionOnLabel(choice.sessionOn)}` : "";
  const current = choice.current ? " (vigente)" : "";
  return `${choice.venue}${when}${current}`;
}
