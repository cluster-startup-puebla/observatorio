"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ReadingToggle } from "@/components/diagnostico/reading-dock";
import { HeaderCtas } from "@/components/site/header-ctas";
import { HeaderLinks } from "@/components/site/header-links";
import { HeaderMenu } from "@/components/site/header-menu";
import { ThemeToggle } from "@/components/site/theme-toggle";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const path = usePathname();
  const onDiagnostic = path === "/diagnostico-tmec-puebla";

  useEffect(() => {
    const update = () => setCondensed(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      <a
        href="#contenido"
        className="fixed top-[-8rem] left-4 z-[60] rounded-full bg-brand px-5 py-3 font-semibold text-on-brand focus:top-4"
      >
        Saltar al contenido
      </a>

      <header
        className={`site-header sticky top-0 z-50 transition-[padding] duration-300 ease-out motion-reduce:transition-none ${
          condensed ? "px-3 pt-2 sm:px-4 sm:pt-3" : "px-0 pt-0"
        }`}
      >
        <div
          className={`mx-auto transition-all duration-300 ease-out motion-reduce:transition-none ${
            condensed
              ? "max-w-6xl rounded-full border border-line bg-surface/90 shadow-md backdrop-blur-md"
              : "max-w-none rounded-none border-b border-line bg-surface/90 backdrop-blur-md"
          }`}
        >
          <div
            className={`flex items-center justify-between gap-4 ${
              condensed ? "px-5 py-2 sm:px-6" : "container-site py-3"
            }`}
          >
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
