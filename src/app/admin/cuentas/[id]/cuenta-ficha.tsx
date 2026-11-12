import { Briefcase, Building2, Landmark, Mail, MessageCircle, Shield, Users } from "lucide-react";
import { FactCard } from "@/components/admin/fact-card";
import { whatsappHref } from "@/lib/admin/crm/whatsapp";
import type { AccountKind } from "@/lib/admin/cuentas/account-kind";

export function CuentaFicha({
  kind,
  email,
  whatsapp,
  jobTitle,
  place,
  placeHref,
  employees,
  role,
}: {
  kind: AccountKind;
  email: string;
  whatsapp: string;
  jobTitle: string;
  place: string;
  placeHref: string;
  employees: string;
  role: string;
}) {
  const extra =
    kind === "empresario"
      ? [
          { icon: Building2, label: "Empresa", value: place, href: placeHref },
          { icon: Users, label: "Tamaño", value: employees },
        ]
      : kind === "organismo"
        ? [
            { icon: Landmark, label: "Organismo", value: place, href: placeHref },
            { icon: Shield, label: "Rol", value: role },
          ]
        : [{ icon: Shield, label: "Rol", value: role }];
  const facts = [
    { icon: Mail, label: "Correo", value: email, href: email ? `mailto:${email}` : "" },
    { icon: MessageCircle, label: "WhatsApp", value: whatsapp, href: whatsappHref(whatsapp) },
    { icon: Briefcase, label: "Puesto", value: jobTitle },
    ...extra,
  ];
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      {facts.map((fact) => (
        <FactCard key={fact.label} {...fact} />
      ))}
    </section>
  );
}
