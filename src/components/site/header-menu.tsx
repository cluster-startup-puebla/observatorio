import { Suspense } from "react";
import Link from "next/link";
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
      </ul>
      <div className="grid gap-2 px-4 pb-4">
        <Suspense>
          <HeaderCtas path={path} onNavigate={onNavigate} />
        </Suspense>
      </div>
    </nav>
  );
}
