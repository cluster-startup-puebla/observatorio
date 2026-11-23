"use client";

import { useState, useTransition, type FormEvent } from "react";
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

export function SessionFilter({
  action,
  choices,
  selectedId,
  allowAll = false,
  submitLabel = "Filtrar",
  testId = "session-filter",
  keep = {},
}: {
  action: string;
  choices: SessionChoice[];
  selectedId: string | null;
  allowAll?: boolean;
  submitLabel?: string;
  testId?: string;
  keep?: Record<string, string>;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const fallback = allowAll ? "" : choices.find((choice) => choice.current)?.id ?? choices[0]?.id ?? "";
  const [selected, setSelected] = useState(selectedId ?? fallback);
  if (choices.length === 0) return null;

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(keep);
    if (selected) params.set("sesion", selected);
    const query = params.toString();
    start(() => router.push(query ? `${action}?${query}` : action));
  }

  return (
    <form onSubmit={apply} className={sessionFilterShell}>
      <label className="grid min-w-0 flex-1 gap-1.5 text-small font-medium text-ink">
        Sesión
        <select
          name="sesion"
          value={selected}
          disabled={pending}
          data-testid={testId}
          className={sessionSelectClass}
          style={{ backgroundImage: sessionChevron }}
          onChange={(event) => setSelected(event.target.value)}
        >
          {allowAll ? <option value="">Todas las sesiones</option> : null}
          {choices.map((choice) => (
            <option key={choice.id} value={choice.id}>
              {optionLabel(choice)}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" size="lg" disabled={pending} className="min-w-[9.5rem] rounded-full px-4">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {pending ? "Cargando…" : submitLabel}
      </Button>
    </form>
  );
}

function optionLabel(choice: SessionChoice) {
  const when = choice.sessionOn ? ` · ${sessionOnLabel(choice.sessionOn)}` : "";
  const current = choice.current ? " (vigente)" : "";
  return `${choice.venue}${when}${current}`;
}
