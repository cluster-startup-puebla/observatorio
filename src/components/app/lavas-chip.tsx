"use client";

import { useState } from "react";
import { Flame } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LAVAS_TOOLTIP } from "@/lib/app/lavas";

export function LavasChip() {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger
        type="button"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-elevated px-3 py-1 text-small font-semibold text-ink"
        onPointerDown={(event) => event.preventDefault()}
        onClick={() => setOpen((value) => !value)}
      >
        <Flame aria-hidden className="size-4" />
        0 lavas
      </TooltipTrigger>
      <TooltipContent side="bottom">{LAVAS_TOOLTIP}</TooltipContent>
    </Tooltip>
  );
}
