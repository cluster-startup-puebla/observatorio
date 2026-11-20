import { Suspense } from "react";
import Link from "next/link";
import { navItems } from "@/content/landing";
import { HeaderCtas } from "@/components/site/header-ctas";
import { navLinkClass } from "@/components/site/header-tone";

export function HeaderMenu({
  path,
  onField,
  onNavigate,
}: {
  path: string;
  onField: boolean;
  onNavigate: () => void;
}) {
  return (
    <nav
      id="mobile-nav"
      className={`lg:hidden ${onField ? "border-t border-white/25" : "border-t border-line"}`}
      aria-label="Principal"
    >
      <ul className="container-site flex flex-col py-2">
        {navItems.map((item) => {
          const current = path === item.href || path.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`block py-3 text-body ${navLinkClass(current, onField)}`}
                onClick={onNavigate}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="container-site grid gap-2 pb-4">
        <Suspense>
          <HeaderCtas path={path} onField={onField} onNavigate={onNavigate} />
        </Suspense>
      </div>
    </nav>
  );
}
