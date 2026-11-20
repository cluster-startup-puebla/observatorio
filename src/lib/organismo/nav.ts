import type { AdminLink } from "@/components/admin/nav";
import { sessionPiecePath } from "@/lib/sessions/public-path";

export function orgLinks(slug: string, sessionSlug?: string): AdminLink[] {
  const root = sessionSlug ? sessionPiecePath(sessionSlug, slug) : `/${slug}`;
  return [
    { href: root, label: "Inicio", group: "Panel" },
    { href: `${root}/invitaciones`, label: "Invitaciones", group: "Panel" },
    { href: `${root}/crm`, label: "CRM", group: "Panel" },
    { href: `${root}/seguridad`, label: "Contraseña", group: "Seguridad" },
  ];
}

export function orgGroups(slug: string, sessionSlug?: string) {
  const links = orgLinks(slug, sessionSlug);
  return [
    { name: "Panel", links: links.filter((link) => link.group === "Panel") },
    { name: "Seguridad", links: links.filter((link) => link.group === "Seguridad") },
  ];
}
