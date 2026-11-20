"use client";

import { Flame } from "lucide-react";
import { LavasSheetContent } from "@/components/app/lavas-sheet";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LAVAS_TOOLTIP, lavasLabel } from "@/lib/app/lavas";
import type { LavaPanel } from "@/lib/lavas/load-panel";

export function LavasChip({ balance, panel }: { balance: number; panel: LavaPanel }) {
  return (
    <Sheet>
      <Tooltip>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-elevated px-3 py-1 text-small font-semibold text-ink"
            >
              <Flame aria-hidden className="size-4" />
              {lavasLabel(balance)}
            </button>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">{LAVAS_TOOLTIP}</TooltipContent>
      </Tooltip>
      <LavasSheetContent panel={panel} />
    </Sheet>
  );
}
