"use client";

import { ChevronDown } from "lucide-react";

const selectClass =
  "w-full min-w-0 max-w-full appearance-none rounded-lg border border-line bg-elevated py-3 pl-4 pr-11 text-body text-ink";

export function FieldSelect({
  value,
  onChange,
  disabled,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        className={selectClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-secondary"
      />
    </div>
  );
}
