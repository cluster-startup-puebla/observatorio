"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { WidgetTone } from "./choice-list";

export function QuestionFrame({
  tone,
  progress,
  kicker,
  kickerMeta,
  trail,
  title,
  canContinue,
  continueLabel,
  onBack,
  onContinue,
  children,
}: {
  tone: WidgetTone;
  progress: number;
  kicker: string;
  kickerMeta?: string;
  trail?: string;
  title: string;
  canContinue: boolean;
  continueLabel: string;
  onBack: () => void;
  onContinue: () => void;
  children: ReactNode;
}) {
  const width = Math.min(100, Math.max(0, progress));

  return (
    <div className="overflow-x-clip bg-surface">
      <div
        className="h-1 bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={width}
      >
        <div className={cn("h-1", tone === "brand" ? "bg-brand" : "bg-navy")} style={{ width: `${width}%` }} />
      </div>
      <main className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-3 px-4 pt-4 pb-36">
        {trail ? <p className="text-sm text-ink-secondary">{trail}</p> : null}
        <div className="flex min-w-0 items-baseline justify-between gap-3">
          <p className={cn("min-w-0 break-words text-sm font-semibold", tone === "brand" ? "text-brand" : "text-navy")}>
            {kicker}
          </p>
          {kickerMeta ? <p className="shrink-0 text-sm tabular-nums text-ink-secondary">{kickerMeta}</p> : null}
        </div>
        <h1 data-testid="pregunta-v2" className="text-xl font-semibold leading-snug text-balance break-words text-ink sm:text-2xl">
          {title}
        </h1>
        {children}
      </main>
      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex w-full min-w-0 max-w-2xl gap-2">
          <button type="button" className="btn shrink-0 px-4" onClick={onBack}>
            Anterior
          </button>
          <button
            type="button"
            className="btn btn-primary min-w-0 flex-1 px-4 disabled:opacity-40"
            disabled={!canContinue}
            onClick={onContinue}
          >
            {continueLabel}
          </button>
        </div>
      </footer>
    </div>
  );
}
