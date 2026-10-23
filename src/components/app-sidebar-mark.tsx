"use client";

import { useState } from "react";

export function AppSidebarMark({ logoSrc, title }: { logoSrc?: string; title: string }) {
  const [broken, setBroken] = useState(false);
  const showLogo = Boolean(logoSrc) && !broken;
  const initial = title.trim().charAt(0).toUpperCase() || "O";

  return (
    <>
      {showLogo ? (
        <img
          src={logoSrc}
          alt=""
          className="h-8 w-auto max-w-36 shrink-0 object-contain object-left group-data-[collapsible=icon]:hidden"
          onError={() => setBroken(true)}
        />
      ) : null}
      <span
        className={
          showLogo
            ? "hidden size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-on-brand group-data-[collapsible=icon]:flex"
            : "flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-on-brand"
        }
      >
        {initial}
      </span>
    </>
  );
}
