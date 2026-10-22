"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ctaLabel } from "@/content/landing";
import { tokenFromQuery } from "@/lib/organismo/event-token";
import { reserveHref } from "@/lib/sectors";

const orgHref = "/register?cuenta=organismo";

export function HeaderCtas({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
  const href = reserveHref(path, tokenFromQuery(useSearchParams()));
  return (
    <>
      <Link href={href} onClick={onNavigate} className="btn btn-primary px-4 py-2 text-small whitespace-nowrap">
        {ctaLabel}
      </Link>
      <Link href={orgHref} onClick={onNavigate} className="btn btn-secondary px-4 py-2 text-small whitespace-nowrap">
        Quiero invitar
      </Link>
    </>
  );
}
