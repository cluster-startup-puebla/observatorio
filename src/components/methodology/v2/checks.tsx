"use client";

import type { V2Factor } from "@/lib/methodology/v2/types";
import { cn } from "@/lib/utils";
import { optionClass, type WidgetTone } from "./choice-list";

export function Checks({
  factors,
  selected,
  tone,
  onChange,
}: {
  factors: V2Factor[];
  selected: string[];
  tone: WidgetTone;
  onChange: (selected: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-small leading-snug text-ink-secondary">
        Marca las que sí tienes. Cada una suma 20, hasta 100.
      </p>
      {factors.map((factor) => {
        const on = selected.includes(factor.id);
        const next = on ? selected.filter((id) => id !== factor.id) : [...selected, factor.id];
        return (
          <button
            key={factor.id}
            type="button"
            data-testid="opcion-v2"
            aria-pressed={on}
            onClick={() => onChange(next)}
            className={cn(
              "rounded-lg border px-4 py-2.5 text-left text-body leading-snug",
              optionClass(tone, on),
            )}
          >
            {factor.label}
          </button>
        );
      })}
    </div>
  );
}
