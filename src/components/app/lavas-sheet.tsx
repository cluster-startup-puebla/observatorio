"use client";

import { LavasHistory } from "@/components/app/lavas-history";
import { LavasValuesTable } from "@/components/app/lavas-values-table";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { lavasLabel } from "@/lib/app/lavas";
import type { LavaPanel } from "@/lib/lavas/load-panel";

export function LavasSheetContent({ panel }: { panel: LavaPanel }) {
  return (
    <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
      <SheetHeader className="border-b border-line pr-10">
        <SheetTitle className="font-display text-h3 text-ink">Lavas</SheetTitle>
        <SheetDescription className="text-small text-ink-secondary">
          Reconocen tu participación. No definen el estatus EIA.
        </SheetDescription>
      </SheetHeader>
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <p className="font-display text-h2 text-ink">{lavasLabel(panel.balance)}</p>
        <section className="grid gap-2">
          <h3 className="text-small font-semibold text-ink">Cómo ganar</h3>
          <LavasValuesTable
            catalog={panel.catalog}
            multiplier={panel.boost.multiplier}
            flatBonus={panel.boost.flatBonus}
          />
        </section>
        <section className="grid gap-2">
          <h3 className="text-small font-semibold text-ink">Historial</h3>
          <LavasHistory rows={panel.history} />
        </section>
      </div>
    </SheetContent>
  );
}
