"use client";

import type { V2Factor } from "@/lib/methodology/v2/types";
import { cn } from "@/lib/utils";
import { optionClass, type WidgetTone } from "./choice-list";

export function RankBoard({
  factors,
  ranks,
  tone,
  onChange,
}: {
  factors: V2Factor[];
  ranks: Record<string, number>;
  tone: WidgetTone;
  onChange: (ranks: Record<string, number>) => void;
}) {
  const used = new Set(Object.values(ranks));
  const slots = Array.from({ length: factors.length }, (_, index) => index + 1);
  const nextRank = slots.find((rank) => !used.has(rank));

  function toggle(factorId: string) {
    if (ranks[factorId] != null) {
      const next = { ...ranks };
      delete next[factorId];
      onChange(next);
      return;
    }
    if (nextRank == null) return;
    onChange({ ...ranks, [factorId]: nextRank });
  }

  const hint =
    nextRank == null
      ? `Los ${factors.length} lugares ya tienen causa. Toca una para soltarla.`
      : `Toca una causa para asignarle el lugar ${nextRank}. El 1 es el mayor impacto.`;

  return (
    <div className="space-y-3">
      <p className="text-small text-ink-secondary">{hint}</p>
      <div className="flex flex-col gap-2">
        {factors.map((factor) => {
          const rank = ranks[factor.id];
          return (
            <button
              key={factor.id}
              type="button"
              aria-pressed={rank != null}
              onClick={() => toggle(factor.id)}
              className={cn(
                "flex w-full min-w-0 items-start gap-3 rounded-lg border px-3 py-3 text-left text-sm leading-relaxed",
                optionClass(tone, rank != null),
              )}
            >
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-current text-small">
                {rank ?? "·"}
              </span>
              <span className="min-w-0 flex-1 break-words">{factor.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
