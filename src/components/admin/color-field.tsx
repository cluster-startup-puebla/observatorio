"use client";

import { useState } from "react";

const fallback = "#16284F";

function hex(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value) ? value.toLowerCase() : fallback.toLowerCase();
}

export function ColorField({ id, name, defaultValue = fallback }: { id: string; name: string; defaultValue?: string }) {
  const [value, setValue] = useState(hex(defaultValue));
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-small text-ink">
        Color
      </label>
      <div className="flex items-center gap-3 rounded-lg border border-line bg-elevated px-3 py-2 has-[:focus-visible]:border-brand has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-brand/30">
        <input
          id={id}
          name={name}
          type="color"
          required
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="size-8 cursor-pointer rounded-md border border-line bg-transparent p-0.5 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
        />
        <span className="text-small font-semibold tracking-wide text-ink">{value.toUpperCase()}</span>
      </div>
    </div>
  );
}
