"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { HeaderLinks } from "@/components/site/header-links";
import { HeaderMenu } from "@/components/site/header-menu";
import { HeaderTools } from "@/components/site/header-tools";
import { onProgramField } from "@/components/site/header-tone";

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

  const onHero = onField && !lifted;
  const bar = onHero
    ? "bg-transparent text-white"
    : "border-b border-line bg-surface/95 text-ink backdrop-blur-md";

  return (
    <>
      <a
        href="#contenido"
        className="fixed top-[-8rem] left-4 z-[60] rounded-full bg-brand px-5 py-3 font-semibold text-on-brand focus:top-4"
      >
        Saltar al contenido
      </a>

      <header className={`site-header sticky top-0 z-50 ${bar}`} data-program-field={onHero ? "" : undefined}>
        <div className="container-site flex items-center justify-between gap-6 py-3">
          <div className="flex min-w-0 items-center gap-5 xl:gap-7">
            <Link
              href="/#inicio"
              className={`shrink-0 font-display text-h4 whitespace-nowrap ${onHero ? "text-white" : "text-ink"}`}
            >
              Observatorio
            </Link>
            <span
              aria-hidden
              className={`hidden h-4 w-px lg:block ${onHero ? "bg-white/45" : "bg-line"}`}
            />
            <HeaderLinks path={path} onField={onHero} />
          </div>
          <HeaderTools
            path={path}
            onHero={onHero}
            onDiagnostic={onDiagnostic}
            open={open}
            onToggle={() => setOpen((value) => !value)}
          />
        </div>
        {open ? <HeaderMenu path={path} onField={onHero} onNavigate={() => setOpen(false)} /> : null}
      </header>
    </>
  );
}
