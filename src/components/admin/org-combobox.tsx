"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { OrgComboboxList } from "@/components/admin/org-combobox-list";

type Org = { id: string; name: string | null };

export function OrgCombobox({
  id,
  name,
  orgs,
  defaultValue = "",
  noneLabel = "Ninguno",
}: {
  id: string;
  name: string;
  orgs: Org[];
  defaultValue?: string;
  noneLabel?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = orgs.find((org) => org.id === value);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return orgs;
    return orgs.filter((org) => (org.name ?? org.id).toLowerCase().includes(needle));
  }, [orgs, query]);

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

  function pick(next: string) {
    setValue(next);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-line bg-elevated px-3 py-2 text-left text-small text-ink"
      >
        <span className="truncate">{selected?.name ?? (value ? value : noneLabel)}</span>
        <ChevronDown className="size-4 shrink-0 text-ink-muted" aria-hidden />
      </button>
      {open ? (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-line bg-elevated p-2 shadow-card">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar organismo"
            className="mb-2 w-full rounded-lg border border-line px-3 py-2 text-small"
            autoFocus
          />
          <OrgComboboxList listId={listId} value={value} noneLabel={noneLabel} filtered={filtered} onPick={pick} />
        </div>
      ) : null}
    </div>
  );
}
