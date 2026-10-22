"use client";

import { useState } from "react";

export function AppSidebarMark({ logoSrc, title }: { logoSrc?: string; title: string }) {
  const [broken, setBroken] = useState(false);
  const showLogo = Boolean(logoSrc) && !broken;

  if (showLogo) {
    return (
      <img
        src={logoSrc}
        alt=""
        className="size-8 rounded-lg bg-elevated object-contain"
        onError={() => setBroken(true)}
      />
    );
  }

  const initial = title.trim().charAt(0).toUpperCase() || "O";
  return (
    <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-xs font-semibold text-on-brand">
      {initial}
    </span>
  );
}
