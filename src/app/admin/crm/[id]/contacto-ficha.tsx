import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Briefcase, Building2, Factory, Globe, Landmark, Mail, MapPin, Megaphone, MessageCircle, MessageSquareText, Quote, Users } from "lucide-react";
import { ContactoAcceso } from "@/app/admin/crm/[id]/contacto-acceso";
import type { ContactPass } from "@/lib/admin/crm/pass";
import { whatsappHref } from "@/lib/admin/crm/whatsapp";
import type { ContactPerson } from "@/lib/admin/crm/person";

function Fact({ icon: Icon, label, value, href, wide }: { icon: LucideIcon; label: string; value: string; href?: string; wide?: boolean }) {
  if (!value) return null;
  const className = wide ? "sm:col-span-2" : "";
  const text = href?.startsWith("http") || href?.startsWith("mailto:") ? (
    <a href={href} className="text-sm font-medium break-words text-link">{value}</a>
  ) : href ? (
    <Link href={href} className="text-sm font-medium break-words text-link">{value}</Link>
  ) : (
    <div className="text-sm font-medium break-words text-ink">{value}</div>
  );
  return (
    <div className={`flex items-start gap-3 rounded-xl border border-line bg-elevated p-3 ${className}`}>
      <Icon className="mt-0.5 size-5 shrink-0 text-ink-secondary" />
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-ink-secondary">{label}</div>
        <div className="mt-1">{text}</div>
      </div>
    </div>
  );
}

export function ContactoFicha({
  id,
  person,
  source,
  pass,
  statusCode,
}: {
  id: string;
  person: ContactPerson;
  source: string;
  pass: ContactPass | null;
  statusCode: string | null;
}) {
  const facts = [
    { icon: Mail, label: "Correo", value: person.email, href: person.email ? `mailto:${person.email}` : "" },
    { icon: MessageCircle, label: "WhatsApp", value: person.whatsapp, href: whatsappHref(person.whatsapp) },
    { icon: Briefcase, label: "Puesto", value: person.jobTitle },
    { icon: Building2, label: "Empresa", value: person.companyName, href: person.companyHref },
    { icon: Landmark, label: "Organismo", value: person.organizationName, href: person.organizationHref },
    { icon: Factory, label: "Industria", value: person.sectorName, href: person.sectorHref },
    { icon: Users, label: "Empleados", value: person.employees },
    { icon: Globe, label: "Tamaño de mercado", value: person.market },
    { icon: MapPin, label: "Municipio", value: person.municipality },
    { icon: Quote, label: "Cómo se enteró", value: person.referral },
    { icon: Megaphone, label: "Origen", value: source },
    { icon: MessageSquareText, label: "Qué le interesa", value: person.interest, wide: true },
  ];
  return (
    <div className="grid gap-6">
      <ContactoAcceso id={id} pass={pass} statusCode={statusCode} />
      <section className="grid gap-3 sm:grid-cols-2">
        {facts.map((fact) => (
          <Fact key={fact.label} {...fact} />
        ))}
      </section>
    </div>
  );
}
