"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { HeaderLinks } from "@/components/site/header-links";
import { HeaderMenu } from "@/components/site/header-menu";
import { headerShell } from "@/components/site/header-shell";
import { HeaderTools } from "@/components/site/header-tools";
import { onProgramField } from "@/components/site/header-tone";
import { useHeroNotch } from "@/components/site/use-hero-notch";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const onField = onProgramField(path);
  const lifted = useHeroNotch(onField);
  const onHero = onField && !lifted;
  const overField = onHero && !open;
  const onDiagnostic = path === "/diagnostico-tmec-puebla";

  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <>
      <a
        href="#contenido"
        className="fixed top-[-8rem] left-4 z-[60] rounded-full bg-brand px-5 py-3 font-semibold text-on-brand focus:top-4"
      >
        Saltar al contenido
      </a>

      <header
        className={`site-header sticky top-0 z-50 transition-[background-color,border-color,color,box-shadow] duration-500 ease-out ${overField ? "border-transparent bg-transparent" : "border-b border-line bg-surface/95 text-ink backdrop-blur-md"}`}
        data-program-field={overField ? "" : undefined}
      >
        <div className={headerShell(overField, lifted && !open)}>
          <div className="flex min-w-0 items-center gap-5 xl:gap-7">
            <Link
              href="/#inicio"
              className={`shrink-0 font-display text-h4 whitespace-nowrap transition-colors duration-500 ${overField ? "text-white" : "text-ink"}`}
            >
              Observatorio
            </Link>
            <span aria-hidden className={`hidden h-4 w-px transition-colors duration-500 lg:block ${overField ? "bg-white/45" : "bg-line"}`} />
            <HeaderLinks path={path} onField={overField} />
          </div>
          <HeaderTools
            path={path}
            onHero={overField}
            onDiagnostic={onDiagnostic}
            open={open}
            onToggle={() => setOpen((value) => !value)}
          />
        </div>
        <div
          className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:hidden ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        >
          <div
            className={`overflow-hidden transition-opacity duration-500 ease-out motion-reduce:transition-none ${open ? "opacity-100" : "opacity-0"}`}
            inert={open ? undefined : true}
          >
            <HeaderMenu path={path} onField={false} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      </header>
    </>
  );
}
