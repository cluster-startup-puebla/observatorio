"use client";

import type { ReactNode } from "react";
import { DebateCard } from "@/components/sessions/disruptors/debate-card";
import type { DebatePanelist } from "@/content/disruptors-debate";

export function DebateColumn({
  label,
  accentClass,
  alignRight = false,
  icon,
  panelists,
  onSelect,
}: {
  label: string;
  accentClass: string;
  alignRight?: boolean;
  icon: ReactNode;
  panelists: DebatePanelist[];
  onSelect: (panelist: DebatePanelist) => void;
}) {
  return (
    <div>
      <div className={alignRight ? "mb-5 flex items-center gap-3 lg:flex-row-reverse" : "mb-5 flex items-center gap-3"}>
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-brand">
          {icon}
        </span>
        <div className={alignRight ? "lg:text-right" : undefined}>
          <p className="text-micro font-semibold tracking-[0.18em] text-ink-secondary uppercase">
            Perspectiva
          </p>
          <h3 className={`font-display text-h3 uppercase ${accentClass}`}>{label}</h3>
        </div>
      </div>
      <div className="grid gap-4">
        {panelists.map((panelist) => (
          <DebateCard key={panelist.name} panelist={panelist} onSelect={() => onSelect(panelist)} />
        ))}
      </div>
    </div>
  );
}
