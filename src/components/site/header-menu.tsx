import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { navItems } from "@/content/landing";
import { HeaderCtas } from "@/components/site/header-ctas";

export function HeaderMenu({ path, onNavigate }: { path: string; onNavigate: () => void }) {
  return (
    <nav
      id="mobile-nav"
      className="mx-3 mt-2 rounded-md border border-line bg-surface shadow-md lg:hidden"
      aria-label="Principal"
    >
      <ul className="flex flex-col p-4">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="block py-3 text-body text-ink-secondary" onClick={onNavigate}>
              {item.label}
            </Link>
          </li>
        ))}
        <li>
          <a
            href="/diagnostico-tmec-puebla"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 py-3 text-body text-ink-secondary"
            onClick={onNavigate}
          >
            T-MEC
            <ArrowUpRight size={16} aria-hidden />
            <span className="sr-only">, se abre en otra pestaña</span>
          </a>
        </li>
      </ul>
      <div className="grid gap-2 px-4 pb-4">
        <Suspense>
          <HeaderCtas path={path} onNavigate={onNavigate} />
        </Suspense>
      </div>
    </nav>
  );
}
