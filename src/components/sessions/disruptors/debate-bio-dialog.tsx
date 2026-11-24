"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DebatePanelist, DebateSide } from "@/content/disruptors-debate";

export function DebateBioDialog({
  selected,
  onClose,
}: {
  selected: { panelist: DebatePanelist; side: DebateSide } | null;
  onClose: () => void;
}) {
  const panelist = selected?.panelist;
  const sideLabel = selected?.side === "tech" ? "Perspectiva Tecnológica" : "Perspectiva Humana";

  return (
    <Dialog open={Boolean(panelist)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        {panelist ? (
          <>
            <DialogHeader className="text-left">
              <div className="flex items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-line bg-navy sm:size-20">
                  <Image
                    src={panelist.photo}
                    alt={panelist.name}
                    fill
                    sizes="80px"
                    className="object-cover object-top"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-micro font-semibold tracking-[0.14em] text-brand uppercase">
                    {sideLabel}
                  </p>
                  <DialogTitle className="mt-1 font-display text-h3 text-ink">
                    {panelist.name}
                  </DialogTitle>
                  <DialogDescription className="mt-0.5 text-small text-ink-secondary">
                    {panelist.role} — {panelist.company}
                  </DialogDescription>
                </div>
              </div>
              <p className="pt-2 text-micro font-semibold tracking-[0.06em] text-navy uppercase">
                {panelist.expertise}
              </p>
            </DialogHeader>
            <div className="grid gap-3 pt-2 text-body text-ink-secondary">
              {panelist.bio.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
