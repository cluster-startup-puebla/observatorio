import type { AdminLink } from "@/components/admin/nav";

export function orgLinks(slug: string): AdminLink[] {
  const root = `/${slug}`;
  return [
    { href: root, label: "Inicio", group: "Panel" },
    { href: `${root}/invitaciones`, label: "Invitaciones", group: "Panel" },
    { href: `${root}/crm`, label: "CRM", group: "Panel" },
    { href: `${root}/seguridad`, label: "Contraseña", group: "Seguridad" },
  ];
}

export function orgGroups(slug: string) {
  const links = orgLinks(slug);
  return [
    { name: "Panel", links: links.filter((link) => link.group === "Panel") },
    { name: "Seguridad", links: links.filter((link) => link.group === "Seguridad") },
  ];
}
