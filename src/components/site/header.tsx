"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ReadingToggle } from "@/components/diagnostico/reading-dock";
import { HeaderCtas } from "@/components/site/header-ctas";
import { HeaderLinks } from "@/components/site/header-links";
import { HeaderMenu } from "@/components/site/header-menu";
import { onProgramField } from "@/components/site/header-tone";
import { ThemeToggle } from "@/components/site/theme-toggle";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);
  const path = usePathname();
  const onField = onProgramField(path);
  const onDiagnostic = path === "/diagnostico-tmec-puebla";

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (!onField) return;
    const sync = () => setLifted(window.scrollY > 12);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, [onField]);

  const bar = onField
    ? `bg-program-field text-white ${lifted ? "shadow-[0_12px_28px_-16px_rgba(28,0,16,0.6)]" : ""}`
    : "border-b border-line bg-surface/95 backdrop-blur-md";

  return (
    <>
      <a
        href="#contenido"
        className="fixed top-[-8rem] left-4 z-[60] rounded-full bg-brand px-5 py-3 font-semibold text-on-brand focus:top-4"
      >
        Saltar al contenido
      </a>

      <header className={`site-header sticky top-0 z-50 ${bar}`} data-program-field={onField ? "" : undefined}>
        <div className="container-site flex items-center justify-between gap-6 py-3">
          <div className="flex min-w-0 items-center gap-5 xl:gap-7">
            <Link
              href="/#inicio"
              className={`shrink-0 font-display text-h4 whitespace-nowrap ${onField ? "text-white" : "text-ink"}`}
            >
              Observatorio
            </Link>
            <span
              aria-hidden
              className={`hidden h-4 w-px lg:block ${onField ? "bg-white/45" : "bg-line"}`}
            />
            <HeaderLinks path={path} onField={onField} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {onDiagnostic ? <ReadingToggle /> : null}
            <div className="hidden items-center gap-2 lg:flex">
              <Suspense>
                <HeaderCtas path={path} onField={onField} />
              </Suspense>
            </div>
            <ThemeToggle onField={onField} />
            <button
              type="button"
              className={`inline-flex size-11 items-center justify-center rounded-full border lg:hidden ${
                onField ? "border-white/40 text-white" : "border-line text-ink"
              }`}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {open ? <HeaderMenu path={path} onField={onField} onNavigate={() => setOpen(false)} /> : null}
      </header>
    </>
  );
}
