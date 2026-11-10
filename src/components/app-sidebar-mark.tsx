"use client";

import { useState } from "react";
import { brandBackground } from "@/lib/organismo/brand-color";

export function AppSidebarMark({
  logoSrc,
  title,
  brandColor,
}: {
  logoSrc?: string;
  title: string;
  brandColor?: string;
}) {
  const [broken, setBroken] = useState(false);
  const showLogo = Boolean(logoSrc) && !broken;
  const initial = title.trim().charAt(0).toUpperCase() || "O";

  return (
    <>
      {showLogo ? (
        <span className="flex h-16 w-full items-center rounded-lg bg-white px-3 group-data-[collapsible=icon]:hidden">
          <img
            src={logoSrc}
            alt=""
            className="h-10 w-auto max-w-full object-contain object-left"
            onError={() => setBroken(true)}
          />
        </span>
      ) : null}
      <span
        className="hidden size-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold group-data-[collapsible=icon]:flex"
        style={{ color: brandBackground(brandColor) }}
      >
        {initial}
      </span>
    </>
  );
}
