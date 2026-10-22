"use client";

import { useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useComboboxDismiss } from "@/components/admin/use-combobox-dismiss";
import { SourceLogo } from "@/components/landing/molecules/source-logo";
import { SourceMenu } from "@/components/landing/molecules/source-menu";
import { clusterLogo, partners } from "@/content/landing";
import { controlClass } from "@/components/landing/molecules/field";

export function SourceCombobox({
  value,
  onChange,
  error,
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const sources = [...partners, clusterLogo];
  const selected = sources.find((partner) => partner.alt === value);
  useComboboxDismiss(rootRef, setOpen);

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name="fuente" value={value} />
      <button
        id="fuente"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "fuente-error" : undefined}
        onClick={() => setOpen((current) => !current)}
        className={`${controlClass} flex items-center justify-between gap-2 text-left`}
      >
        {selected ? (
          <span className="flex min-w-0 items-center gap-2">
            <SourceLogo src={selected.src} width={selected.width} height={selected.height} compact={compact} />
            <span className="truncate">{selected.alt}</span>
          </span>
        ) : (
          <span className="text-ink-muted">Elige el organismo</span>
        )}
        <ChevronDown className="size-4 shrink-0 text-ink-muted" aria-hidden />
      </button>
      {open ? (
        <SourceMenu
          listId={listId}
          sources={sources}
          value={value}
          compact={compact}
          onPick={(alt) => {
            onChange(alt);
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
