"use client";

import type { V2Option } from "@/lib/methodology/v2/types";
import { cn } from "@/lib/utils";
import { optionClass, type WidgetTone } from "./choice-list";

export function LikertFive({
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
  const ordered = [...options].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const last = ordered.length - 1;

  return (
    <div className="flex flex-col gap-2">
      {ordered.map((option, index) => {
        const selected = option.value === value;
        const amount = last === 0 ? 1 : 1 - index / last;
        return (
          <button
            key={option.value}
            type="button"
            data-testid="opcion-v2"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
              optionClass(tone, selected),
            )}
          >
            <Face amount={amount} />
            <span className="flex-1 text-body leading-snug">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Face({ amount }: { amount: number }) {
  const smile = amount * 2 - 1;
  const y = 15.2 - smile * 1.1;
  const bend = smile * 2.1;
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 size-6 shrink-0" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
      <path
        d={`M8.2 ${y}c1.1 ${bend * 0.7} 2.3 ${bend} 3.8 ${bend}s2.7 ${bend * -0.3} 3.8 ${-bend}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
