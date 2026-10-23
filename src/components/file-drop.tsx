"use client";

import { ImagePlus, Upload } from "lucide-react";
import { useState } from "react";

type FileDropProps = {
  id: string;
  name: string;
  label: string;
  accept: string;
  hint: string;
  preview?: boolean;
  tracked?: boolean;
  onChosen?: (file: File | null) => void;
};

export function FileDrop({ id, name, label, accept, hint, preview, tracked, onChosen }: FileDropProps) {
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const hintId = `${id}-hint`;

  function choose(next: File | null) {
    setFile(next);
    setSrc((current) => {
      if (current) URL.revokeObjectURL(current);
      if (!next || !preview || !next.type.startsWith("image/")) return null;
      return URL.createObjectURL(next);
    });
    onChosen?.(next);
  }

  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-small text-ink">
        {label}
      </label>
      <div
        className={`relative overflow-hidden rounded-lg border bg-elevated transition-colors has-[:focus-visible]:border-brand has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-brand/30 ${
          file ? "border-brand" : "border-dashed border-line hover:border-brand hover:bg-brand/5"
        }`}
      >
        <input
          id={id}
          name={name}
          type="file"
          accept={accept}
          aria-describedby={hintId}
          data-invite-file={tracked ? "" : undefined}
          className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
          onChange={(event) => choose(event.target.files?.[0] ?? null)}
        />
        <span className="pointer-events-none flex items-center gap-3 px-3 py-3">
          {src ? (
            <img
              src={src}
              alt="Vista previa del logo"
              className="size-12 shrink-0 rounded-lg border border-line bg-surface-subtle object-contain"
            />
          ) : (
            <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
              {preview ? <ImagePlus className="size-5" /> : <Upload className="size-5" />}
            </span>
          )}
          <span className="grid min-w-0 gap-0.5 text-left">
            <span className="truncate text-small font-semibold text-ink">{file ? file.name : "Elegir archivo"}</span>
            <span id={hintId} className="text-micro text-ink-muted">
              {file ? "Listo para subir" : hint}
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}
