import type { AdminLink } from "@/components/admin/nav";

export function orgLinks(slug: string): AdminLink[] {
  const root = `/${slug}`;
  return [
    { href: root, label: "Inicio", group: "Panel" },
    { href: `${root}/invitaciones`, label: "Invitaciones", group: "Panel" },
    { href: `${root}/crm`, label: "CRM", group: "Panel" },
  ];
}

export function orgGroups(slug: string) {
  return [{ name: "Panel", links: orgLinks(slug) }];
}
