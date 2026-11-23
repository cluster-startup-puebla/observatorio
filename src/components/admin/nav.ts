export type AdminLink = { href: string; label: string; group: string };

export const adminLinks: AdminLink[] = [
  { href: "/admin", label: "Inicio", group: "Dashboard" },
  { href: "/admin/mesa", label: "Registro", group: "Dashboard" },
  { href: "/admin/pases", label: "Pases y llegadas", group: "Dashboard" },

  { href: "/admin/registros", label: "Registros públicos", group: "Embudo" },
  { href: "/admin/invitaciones", label: "Invitaciones", group: "Embudo" },
  { href: "/admin/crm", label: "CRM", group: "Embudo" },

  { href: "/admin/cuentas", label: "Cuentas", group: "Directorio" },
  { href: "/admin/empresas", label: "Empresas", group: "Directorio" },
  { href: "/admin/organismos", label: "Organismos", group: "Directorio" },
  { href: "/admin/logo", label: "Logos", group: "Directorio" },

  { href: "/admin/sesiones", label: "Sesiones", group: "Programa" },
  { href: "/admin/sectores", label: "Sectores", group: "Programa" },
  { href: "/admin/metodologia", label: "Metodología", group: "Programa" },
  { href: "/admin/medios", label: "Medios", group: "Programa" },

  { href: "/admin/diagnosticos", label: "Diagnósticos", group: "Participación" },
  { href: "/admin/innovacion", label: "Innovación abierta", group: "Participación" },
  { href: "/admin/retos", label: "Retos", group: "Participación" },
  { href: "/admin/lavas", label: "Lavas", group: "Participación" },

  { href: "/admin/bandeja", label: "Bandeja", group: "Comunicación" },
  { href: "/admin/correo", label: "Correo masivo", group: "Comunicación" },
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
