"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { ctaLabel, navItems } from "@/content/landing";
import { reserveHref } from "@/lib/sectors";
import { ReadingToggle } from "@/components/diagnostico/reading-dock";
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
            <a href="/#inicio" className="shrink-0 font-display text-h4 whitespace-nowrap text-ink">
              Observatorio
            </a>

            <nav className="hidden lg:block" aria-label="Principal">
              <ul className="flex items-center gap-4 xl:gap-5">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-small whitespace-nowrap text-ink-secondary transition hover:text-ink"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="/diagnostico-tmec-puebla"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-small whitespace-nowrap text-ink-secondary transition hover:text-ink"
                  >
                    T-MEC
                    <ArrowUpRight size={14} aria-hidden />
                    <span className="sr-only">, se abre en otra pestaña</span>
                  </a>
                </li>
              </ul>
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              {onDiagnostic ? <ReadingToggle /> : null}
              <a
                href={reserveHref(path)}
                className="btn btn-primary hidden px-4 py-2 text-small whitespace-nowrap lg:inline-flex"
              >
                {ctaLabel}
              </a>
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

        {open ? (
          <nav
            id="mobile-nav"
            className="mx-3 mt-2 rounded-md border border-line bg-surface shadow-md lg:hidden"
            aria-label="Principal"
          >
            <ul className="flex flex-col p-4">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="block py-3 text-body text-ink-secondary"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/diagnostico-tmec-puebla"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 py-3 text-body text-ink-secondary"
                  onClick={() => setOpen(false)}
                >
                  T-MEC
                  <ArrowUpRight size={16} aria-hidden />
                  <span className="sr-only">, se abre en otra pestaña</span>
                </a>
              </li>
            </ul>
          </nav>
        ) : null}
      </header>
    </>
  );
}
