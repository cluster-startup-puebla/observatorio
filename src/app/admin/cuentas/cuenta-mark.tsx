"use client";

import { useState } from "react";
import { User } from "lucide-react";

export function CuentaMark({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className="grid size-8 place-items-center rounded-full border border-line bg-surface-subtle text-ink">
        <User className="size-4" />
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      className="size-8 rounded-md border border-line bg-elevated object-contain"
      onError={() => setFailed(true)}
    />
  );
}
