"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ReadingToggle } from "@/components/diagnostico/reading-dock";
import { HeaderCtas } from "@/components/site/header-ctas";
import { HeaderLinks } from "@/components/site/header-links";
import { HeaderMenu } from "@/components/site/header-menu";
import { ThemeToggle } from "@/components/site/theme-toggle";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const onDiagnostic = path === "/diagnostico-tmec-puebla";

  return (
    <>
      <a
        href="#contenido"
        className="fixed top-[-8rem] left-4 z-[60] rounded-full bg-brand px-5 py-3 font-semibold text-on-brand focus:top-4"
      >
        Saltar al contenido
      </a>

      <header className="site-header sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur-md">
        <div className="mx-auto max-w-none">
          <div className="container-site flex items-center justify-between gap-4 py-3">
            <Link href="/#inicio" className="shrink-0 font-display text-h4 whitespace-nowrap text-ink">
              Observatorio
            </Link>
            <HeaderLinks />
            <div className="flex shrink-0 items-center gap-2">
              {onDiagnostic ? <ReadingToggle /> : null}
              <div className="hidden items-center gap-2 lg:flex">
                <Suspense>
                  <HeaderCtas path={path} />
                </Suspense>
              </div>
              <ThemeToggle />
              <button
                type="button"
                className="rounded-sm border border-line p-2 text-ink lg:hidden"
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? "Cerrar menú" : "Abrir menú"}
                onClick={() => setOpen((value) => !value)}
              >
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
        {open ? <HeaderMenu path={path} onNavigate={() => setOpen(false)} /> : null}
      </header>
    </>
  );
}
