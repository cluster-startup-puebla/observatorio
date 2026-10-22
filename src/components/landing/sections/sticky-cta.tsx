"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ctaLabel } from "@/content/landing";
import { tokenFromQuery } from "@/lib/organismo/event-token";
import { reserveHref } from "@/lib/sectors";

export function StickyCta() {
  const path = usePathname();
  const href = reserveHref(path, tokenFromQuery(useSearchParams()));
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 p-3 backdrop-blur lg:hidden">
      <Link href={href} className="btn btn-primary w-full">
        {ctaLabel}
      </Link>
    </div>
  );
}
