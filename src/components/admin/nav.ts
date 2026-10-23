export type AdminLink = { href: string; label: string; group: string };

export const adminLinks: AdminLink[] = [
  { href: "/admin", label: "Inicio", group: "Operación" },
  { href: "/admin/mesa", label: "Mesa", group: "Operación" },
  { href: "/admin/correo", label: "Correo masivo", group: "Operación" },
  { href: "/admin/bandeja", label: "Bandeja", group: "Operación" },
  { href: "/admin/cuentas", label: "Cuentas", group: "Directorio" },
  { href: "/admin/organismos", label: "Organismos", group: "Directorio" },
  { href: "/admin/empresas", label: "Empresas", group: "Directorio" },
  { href: "/admin/crm", label: "CRM", group: "Directorio" },
  { href: "/admin/invitaciones", label: "Invitaciones", group: "Directorio" },
  { href: "/admin/pases", label: "Pases y llegadas", group: "Directorio" },
  { href: "/admin/sectores", label: "Sectores", group: "Contenido" },
  { href: "/admin/sesiones", label: "Sesiones", group: "Contenido" },
  { href: "/admin/metodologia", label: "Metodología", group: "Contenido" },
  { href: "/admin/medios", label: "Medios", group: "Contenido" },
];

export function adminGroups() {
  const groups: { name: string; links: AdminLink[] }[] = [];
  for (const link of adminLinks) {
    const group = groups.find((item) => item.name === link.group);
    if (group) group.links.push(link);
    else groups.push({ name: link.group, links: [link] });
  }
  return groups;
}
