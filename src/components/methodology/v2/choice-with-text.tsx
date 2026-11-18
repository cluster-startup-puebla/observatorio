"use client";

import { controlClass } from "@/components/landing/molecules/field";
import type { V2Option } from "@/lib/methodology/v2/types";
import { ChoiceList, type WidgetTone } from "./choice-list";

export function ChoiceWithText({
  options,
  value,
  text,
  maxLength = 100,
  textOptionValue,
  tone,
  onChange,
}: {
  options: V2Option[];
  value: string | null;
  text: string;
  maxLength?: number;
  textOptionValue: string | null;
  tone: WidgetTone;
  onChange: (next: { optionValue: string; text: string }) => void;
}) {
  const showText = textOptionValue == null || value === textOptionValue;

  return (
    <div className="min-w-0 space-y-3 overflow-x-clip">
      <ChoiceList
        options={options}
        value={value}
        tone={tone}
        onChange={(optionValue) =>
          onChange({
            optionValue,
            text: optionValue === textOptionValue || textOptionValue == null ? text : "",
          })
        }
      />
      {showText ? (
        <label className="grid gap-2 text-small text-ink-secondary">
          <span>En tus palabras. Máximo {maxLength} caracteres.</span>
          <textarea
            value={text}
            maxLength={maxLength}
            rows={3}
            onChange={(event) =>
              onChange({ optionValue: value ?? "", text: event.target.value.slice(0, maxLength) })
            }
            className={`${controlClass} resize-none`}
          />
          <span className="text-right tabular-nums">
            {text.length} / {maxLength}
          </span>
        </label>
      ) : null}
    </div>
  );
}
