"use client";

import { useState } from "react";

export type MonochromeInk = "light" | "dark";

const filters: Record<MonochromeInk, string> = {
  light: "brightness(0) invert(1)",
  dark: "brightness(0)",
};

export function AppSidebarMark({
  logoSrc,
  title,
  monochromeInk,
}: {
  logoSrc?: string;
  title: string;
  monochromeInk?: MonochromeInk;
}) {
  const [broken, setBroken] = useState(false);
  const showLogo = Boolean(logoSrc) && !broken;
  const initial = title.trim().charAt(0).toUpperCase() || "O";
  if (!showLogo) {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
        {initial}
      </span>
    );
  }

  return (
    <img
      src={logoSrc}
      alt=""
      style={monochromeInk ? { filter: filters[monochromeInk] } : undefined}
      className="h-8 w-auto max-w-36 shrink-0 rounded-lg object-contain object-left group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:object-cover"
      onError={() => setBroken(true)}
    />
  );
}
