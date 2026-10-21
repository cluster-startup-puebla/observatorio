"use client";

import { usePathname } from "next/navigation";
import { ctaLabel } from "@/content/landing";
import { reserveHref } from "@/lib/sectors";

export function StickyCta() {
  const path = usePathname();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 p-3 backdrop-blur lg:hidden">
      <a href={reserveHref(path)} className="btn btn-primary w-full">
        {ctaLabel}
      </a>
    </div>
  );
}
