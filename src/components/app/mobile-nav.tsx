"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { empresarioNav, isEmpresarioNavActive } from "@/lib/app/nav";

export function MobileNav() {
  const path = usePathname();

  return (
    <nav
      aria-label="Navegación"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-3 right-3 z-30 md:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch rounded-3xl bg-ink px-1 py-2 shadow-[0_16px_40px_-12px_rgb(22_40_79/0.45)]">
        {empresarioNav().map((item) => {
          const active = isEmpresarioNavActive(path, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                prefetch
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "flex flex-col items-center gap-1 rounded-2xl bg-elevated px-1 py-1.5 text-ink"
                    : "flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-on-brand/80"
                }
              >
                <Icon aria-hidden className="size-5 shrink-0" />
                <span className="max-w-full truncate text-[10px] leading-none font-semibold">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
