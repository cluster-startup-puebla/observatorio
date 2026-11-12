import { Briefcase, Building2, Factory, Globe, Landmark, Mail, MapPin, Megaphone, MessageCircle, MessageSquareText, Quote, Users } from "lucide-react";
import { ContactoAcceso } from "@/app/admin/crm/[id]/contacto-acceso";
import { FactCard } from "@/components/admin/fact-card";
import type { ContactPass } from "@/lib/admin/crm/pass";
import { whatsappHref } from "@/lib/admin/crm/whatsapp";
import type { ContactPerson } from "@/lib/admin/crm/person";

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
          <FactCard key={fact.label} {...fact} />
        ))}
      </section>
    </div>
  );
}
