"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Menu, X } from "lucide-react";
import { ReadingToggle } from "@/components/diagnostico/reading-dock";
import { HeaderCtas } from "@/components/site/header-ctas";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { companyAccountHref } from "@/content/landing";

export function HeaderTools({
  path,
  onHero,
  onDiagnostic,
  open,
  onToggle,
}: {
  path: string;
  onHero: boolean;
  onDiagnostic: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      {onDiagnostic ? <ReadingToggle /> : null}
      <Link
        href={path === "/" ? companyAccountHref : "/crear-cuenta"}
        className={`btn px-3 py-2 text-small lg:hidden ${onHero ? "bg-white text-program-field" : "btn-primary"}`}
      >
        Crear cuenta
      </Link>
      <div className="hidden items-center gap-2 lg:flex">
        <Suspense>
          <HeaderCtas path={path} onField={onHero} />
        </Suspense>
      </div>
      <ThemeToggle onField={onHero} />
      <button
        type="button"
        className={`inline-flex size-11 items-center justify-center rounded-full border lg:hidden ${
          onHero ? "border-white/40 text-white" : "border-line text-ink"
        }`}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={onToggle}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
    </div>
  );
}
