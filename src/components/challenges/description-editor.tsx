"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { cn } from "cn";
import { RichTextView } from "./rich-text-view";
import {
  DescriptionModeBar,
  type DescriptionMode,
} from "./description-mode-bar";

const RichTextEditor = dynamic(
  () => import("./rich-text-editor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <p className="p-4 text-small text-ink-secondary">Cargando editor…</p>
    ),
  },
);

const KEY = "challenge-editor-view-mode";

function initialMode(): DescriptionMode {
  if (typeof window === "undefined") return "editor";
  const saved = localStorage.getItem(KEY);
  if (saved === "editor" || saved === "preview" || saved === "split") return saved;
  return window.matchMedia("(min-width: 768px)").matches ? "split" : "editor";
}

export function DescriptionEditor({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
}) {
  const [mode, setMode] = useState<DescriptionMode>("editor");
  useEffect(() => {
    setMode(initialMode());
  }, []);
  useEffect(() => {
    localStorage.setItem(KEY, mode);
  }, [mode]);

  if (disabled) {
    return (
      <div className="min-w-0 max-w-full overflow-hidden rounded-lg border border-line bg-elevated p-4">
        <RichTextView html={value} />
      </div>
    );
  }

  const showSplit = mode === "split";
  const showEditor = mode !== "preview";
  const showPreview = mode !== "editor";

  return (
    <div className="flex min-w-0 max-w-full flex-col overflow-hidden rounded-lg border border-line bg-elevated">
      <DescriptionModeBar mode={mode} setMode={setMode} />
      <div
        className={cn(
          "grid min-h-52 min-w-0 md:min-h-80",
          showSplit && "md:grid-cols-2",
        )}
      >
        {showEditor ? <RichTextEditor value={value} onChange={onChange} /> : null}
        {showPreview ? (
          <div
            className={cn(
              "min-w-0 overflow-y-auto bg-surface-subtle p-4",
              showSplit && "hidden border-l border-line md:block",
              mode === "preview" && "block",
            )}
          >
            <p className="mb-2 text-small font-medium text-ink-secondary">
              Vista previa
            </p>
            <RichTextView html={value} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
