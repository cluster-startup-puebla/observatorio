import Link from "next/link";
import { adminLinks } from "@/components/admin/nav";

export type Crumb = { name: string; href: string };

export const homeCrumb: Crumb = { name: "Inicio", href: "/admin" };

export function listCrumbs(title: string, href: string): Crumb[] {
  return [homeCrumb, { name: title, href }];
}

export function trailCrumbs(sectionName: string, sectionHref: string, current: string): Crumb[] {
  return [homeCrumb, { name: sectionName, href: sectionHref }, { name: current, href: sectionHref }];
}

export function parentLabel(href: string) {
  return adminLinks.find((link) => link.href === href)?.label ?? href;
}

export function PanelCrumbs({ crumbs }: { crumbs: Crumb[] }) {
  const last = crumbs.length - 1;

  return (
    <nav aria-label="Migas de pan">
      <ol className="flex flex-wrap items-center">
        {crumbs.map((crumb, index) => {
          const current = index === last;
          const parent = crumbs[index - 1];
          const linked = !current || !parent || crumb.href !== parent.href;
          const className = current
            ? "text-small font-semibold text-ink"
            : "text-small text-ink-secondary hover:text-ink";
          return (
            <li key={`${index}-${crumb.name}`} className="flex items-center">
              {linked ? (
                <Link href={crumb.href} aria-current={current ? "page" : undefined} className={className}>
                  {crumb.name}
                </Link>
              ) : (
                <span className={className} aria-current="page">
                  {crumb.name}
                </span>
              )}
              {current ? null : (
                <span className="mx-2 text-small text-ink-secondary" aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
