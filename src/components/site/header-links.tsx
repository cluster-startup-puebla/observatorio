import Link from "next/link";
import { navItems } from "@/content/landing";

export function HeaderLinks() {
  return (
    <nav className="hidden lg:block" aria-label="Principal">
      <ul className="flex items-center gap-4 xl:gap-5">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-small whitespace-nowrap text-ink-secondary transition hover:text-ink">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
