import Link from "next/link";
import { navItems } from "@/content/landing";
import { navLinkClass } from "@/components/site/header-tone";

export function HeaderLinks({ path, onField }: { path: string; onField: boolean }) {
  return (
    <nav className="hidden lg:block" aria-label="Principal">
      <ul className="flex items-center gap-5 xl:gap-6">
        {navItems.map((item) => {
          const current = path === item.href || path.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`text-small whitespace-nowrap transition ${navLinkClass(current, onField)}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
