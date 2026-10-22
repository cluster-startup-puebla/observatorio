import { ArrowUpRight } from "lucide-react";
import { navItems } from "@/content/landing";

export function HeaderLinks() {
  return (
    <nav className="hidden lg:block" aria-label="Principal">
      <ul className="flex items-center gap-4 xl:gap-5">
        {navItems.map((item) => (
          <li key={item.href}>
            <a href={item.href} className="text-small whitespace-nowrap text-ink-secondary transition hover:text-ink">
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
  );
}
