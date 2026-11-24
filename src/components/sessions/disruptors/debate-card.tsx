"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { DebatePanelist } from "@/content/disruptors-debate";

export function DebateCard({
  panelist,
  onSelect,
}: {
  panelist: DebatePanelist;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex w-full items-center gap-4 rounded-2xl border border-line bg-surface p-4 text-left transition-colors hover:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-line bg-navy sm:size-24">
        <Image
          src={panelist.photo}
          alt={panelist.name}
          fill
          sizes="96px"
          className="object-cover object-top"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-display text-body font-bold leading-snug text-ink sm:text-h4">
          {panelist.name}
        </h4>
        <p className="mt-0.5 text-small text-ink-secondary">
          {panelist.role} — {panelist.company}
        </p>
        <p className="mt-1.5 text-micro font-semibold tracking-[0.06em] text-brand uppercase">
          {panelist.expertise}
        </p>
        <span className="mt-2 inline-flex items-center gap-1 text-micro font-semibold tracking-[0.08em] text-navy uppercase group-hover:text-brand">
          Ver perfil
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </button>
  );
}
