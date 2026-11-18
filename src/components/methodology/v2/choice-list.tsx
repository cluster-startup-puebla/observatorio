"use client";

import type { V2Option } from "@/lib/methodology/v2/types";
import { cn } from "@/lib/utils";

export type WidgetTone = "brand" | "navy";

export function optionClass(tone: WidgetTone, selected: boolean) {
  if (!selected) return "border-line bg-surface text-ink";
  if (tone === "brand") return "border-transparent bg-brand text-white";
  return "border-transparent bg-navy text-white";
}

export function ChoiceList({
  options,
  value,
  tone,
  onChange,
}: {
  options: V2Option[];
  value: string | null;
  tone: WidgetTone;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            data-testid="opcion-v2"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-lg border px-4 py-2.5 text-left text-body leading-snug transition-colors",
              optionClass(tone, selected),
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
