"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/site/theme-toggle";

const ITEMS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Lectura", href: "#lectura" },
  { label: "Cómo", href: "#como" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);

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
        className={`sticky top-0 z-50 transition-[padding] duration-300 ease-out motion-reduce:transition-none ${
          condensed ? "px-3 pt-2 sm:px-4 sm:pt-3" : "px-0 pt-0"
        }`}
      >
        <div
          className={`mx-auto transition-all duration-300 ease-out motion-reduce:transition-none ${
            condensed
              ? "max-w-4xl rounded-full border border-line bg-surface/90 shadow-md backdrop-blur-md"
              : "max-w-none rounded-none border-b border-line bg-surface/90 backdrop-blur-md"
          }`}
        >
          <div className="container-site flex items-center justify-between gap-4 py-3">
            <a href="#inicio" className="font-display text-h4 text-ink">
              Observatorio
            </a>

            <nav className="hidden lg:block" aria-label="Principal">
              <ul className="flex items-center gap-5">
                {ITEMS.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-small text-ink-secondary transition hover:text-ink">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
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
              {ITEMS.map((item) => (
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
            </ul>
          </nav>
        ) : null}
      </header>
    </>
  );
}
