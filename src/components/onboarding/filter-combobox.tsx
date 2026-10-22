"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useComboboxDismiss } from "@/components/admin/use-combobox-dismiss";
import { Field } from "@/components/landing/molecules/field";
import { FilterComboboxInput } from "@/components/onboarding/filter-combobox-input";
import { FilterComboboxList } from "@/components/onboarding/filter-combobox-list";
import { customComboboxLabel, matchCombobox } from "@/components/onboarding/match-combobox";

type Option = { value: string; label: string };

export function FilterCombobox({
  id,
  name,
  label,
  value,
  options,
  allowCustom = false,
  placeholder = "Escribe para buscar",
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  options: Option[];
  allowCustom?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [options, query]);
  useComboboxDismiss(rootRef, setOpen);

  function commit(text: string) {
    const next = matchCombobox(text, options, allowCustom, filtered);
    if (next) onChange(next);
    setQuery("");
    setOpen(false);
  }

  function showList(next: boolean) {
    setOpen(next);
    if (next) setQuery("");
  }

  return (
    <Field id={id} label={label}>
      <div ref={rootRef} className="relative">
        <input type="hidden" name={name} value={value} />
        <FilterComboboxInput
          id={id}
          listId={listId}
          label={label}
          open={open}
          placeholder={placeholder}
          text={open ? query : (selected?.label ?? value)}
          onQuery={(next) => {
            setQuery(next);
            setOpen(true);
          }}
          onOpen={showList}
          onCommit={() => commit(query)}
        />
        {open ? (
          <FilterComboboxList
            listId={listId}
            label={label}
            options={filtered}
            value={value}
            customLabel={customComboboxLabel(query, options, allowCustom)}
            onPick={commit}
          />
        ) : null}
      </div>
    </Field>
  );
}
