"use client";

import { ChevronDown } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import { SearchComboboxList } from "@/components/admin/search-combobox-list";
import { useComboboxDismiss } from "@/components/admin/use-combobox-dismiss";

type Item = { id: string; label: string };

export function SearchCombobox({
  id,
  name,
  items,
  defaultValue = "",
  noneLabel = "Ninguno",
  searchPlaceholder = "Buscar",
  listLabel = "Opciones",
}: {
  id: string;
  name: string;
  items: Item[];
  defaultValue?: string;
  noneLabel?: string;
  searchPlaceholder?: string;
  listLabel?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = items.find((item) => item.id === value);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => item.label.toLowerCase().includes(needle));
  }, [items, query]);
  useComboboxDismiss(rootRef, setOpen);

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
        <span className="truncate">{selected?.label ?? (value ? value : noneLabel)}</span>
        <ChevronDown className="size-4 shrink-0 text-ink-muted" aria-hidden />
      </button>
      {open ? (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-line bg-elevated p-2 shadow-card">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="mb-2 w-full rounded-lg border border-line px-3 py-2 text-small"
            autoFocus
          />
          <SearchComboboxList
            listId={listId}
            label={listLabel}
            value={value}
            noneLabel={noneLabel}
            filtered={filtered}
            onPick={(next) => {
              setValue(next);
              setQuery("");
              setOpen(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
