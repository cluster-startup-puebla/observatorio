"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { WidgetTone } from "./choice-list";

export function QuestionFrame({
  tone,
  progress,
  kicker,
  kickerMeta,
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
  title: string;
  canContinue: boolean;
  continueLabel: string;
  onBack: () => void;
  onContinue: () => void;
  children: ReactNode;
}) {
  const width = Math.min(100, Math.max(0, progress));

  return (
    <div className="min-h-screen bg-surface">
      <div
        className="h-1 bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={width}
      >
        <div className={cn("h-1", tone === "brand" ? "bg-brand" : "bg-navy")} style={{ width: `${width}%` }} />
      </div>
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pt-4 pb-28">
        <div className="flex items-baseline justify-between gap-3">
          <p className={cn("text-small font-semibold", tone === "brand" ? "text-brand" : "text-navy")}>{kicker}</p>
          {kickerMeta ? <p className="shrink-0 text-small tabular-nums text-ink-secondary">{kickerMeta}</p> : null}
        </div>
        <h1 data-testid="pregunta-v2" className="text-h2 text-ink">
          {title}
        </h1>
        {children}
      </main>
      <footer className="fixed inset-x-0 bottom-0 border-t border-line bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex w-full max-w-2xl gap-2">
          <button type="button" className="btn" onClick={onBack}>
            Anterior
          </button>
          <button type="button" className="btn btn-primary flex-1 disabled:opacity-40" disabled={!canContinue} onClick={onContinue}>
            {continueLabel}
          </button>
        </div>
      </footer>
    </div>
  );
}
