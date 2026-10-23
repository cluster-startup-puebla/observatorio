"use client";

import { useState } from "react";

export function FallbackImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <span className="text-small text-ink-secondary">{alt || "—"}</span>;
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}
