"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { ThemedLogo } from "@/components/landing/atoms/partner-mark";
import { clusterLogo, partners } from "@/content/landing";
import { controlClass } from "@/components/landing/molecules/field";

function SourceLogo({
  src,
  width,
  height,
}: {
  src: string;
  width: number;
  height: number;
}) {
  return (
    <span className="inline-flex h-12 shrink-0 items-center justify-center">
      <ThemedLogo
        src={src}
        alt=""
        width={width}
        height={height}
        className="h-11 w-auto max-w-52 object-contain"
      />
    </span>
  );
}

export function SourceCombobox({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const sources = [...partners, clusterLogo];
  const selected = sources.find((partner) => partner.alt === value);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

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
        className={`${controlClass} flex items-center justify-between gap-3 text-left`}
      >
        {selected ? (
          <span className="flex min-w-0 items-center gap-3">
            <SourceLogo src={selected.src} width={selected.width} height={selected.height} />
            <span className="truncate">{selected.alt}</span>
          </span>
        ) : (
          <span className="text-ink-muted">Elige el organismo</span>
        )}
        <ChevronDown className="size-4 shrink-0 text-ink-muted" aria-hidden />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="¿Cómo te enteraste?"
          className="absolute z-20 mt-2 max-h-96 w-full overflow-auto rounded-sm border border-line bg-elevated p-1 shadow-[var(--card-shadow)]"
        >
          {sources.map((partner) => {
            const active = partner.alt === value;
            return (
              <li key={partner.src} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(partner.alt);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-left text-small text-ink hover:bg-surface-subtle ${
                    active ? "bg-surface-subtle" : ""
                  }`}
                >
                  <SourceLogo src={partner.src} width={partner.width} height={partner.height} />
                  <span className="min-w-0">{partner.alt}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
