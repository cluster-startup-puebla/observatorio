"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { companyAccountHref, ctaLabel } from "@/content/landing";
import { tokenFromQuery } from "@/lib/organismo/event-token";
import { reserveHref } from "@/lib/sectors";

const size = "px-4 py-2 text-small whitespace-nowrap";

export function HeaderCtas({
  path,
  onField,
  onNavigate,
  loginOnly = false,
}: {
  path: string;
  onField: boolean;
  onNavigate?: () => void;
  loginOnly?: boolean;
}) {
  const accountHref = path === "/" ? companyAccountHref : reserveHref(path, tokenFromQuery(useSearchParams()));
  const primary = onField
    ? `btn bg-white text-program-field hover:bg-white/90 ${size}`
    : `btn btn-primary ${size}`;
  const secondary = onField
    ? `btn border border-white/80 bg-transparent text-white hover:bg-white hover:text-program-field ${size}`
    : `btn btn-secondary ${size}`;

  return (
    <>
      {loginOnly ? null : (
        <Link href={accountHref} onClick={onNavigate} className={primary}>
          {ctaLabel}
        </Link>
      )}
      <Link href="/login" onClick={onNavigate} className={secondary}>
        Entrar
      </Link>
    </>
  );
}
