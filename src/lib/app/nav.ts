import type { LucideIcon } from "lucide-react";
import { Building2, Calendar, Flag, House, User } from "lucide-react";

export type EmpresarioNavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const links: EmpresarioNavLink[] = [
  { href: "/app/home", label: "Inicio", icon: House },
  { href: "/app/sesiones", label: "Sesiones", icon: Calendar },
  { href: "/app/challenges", label: "Retos", icon: Flag },
  { href: "/app/company", label: "Empresa", icon: Building2 },
  { href: "/app/profile", label: "Perfil", icon: User },
];

export function empresarioNav() {
  return links;
}

export function isEmpresarioNavActive(path: string, href: string) {
  return path === href || path.startsWith(`${href}/`);
}
