import { Briefcase, Building2, Calendar, CalendarCheck, Layers, Mail, MapPin, MessageCircle, User, Users } from "lucide-react";
import { FactCard } from "@/components/admin/fact-card";
import { whatsappHref } from "@/lib/admin/crm/whatsapp";
import type { PassFace } from "@/lib/admin/pases/relations";

export function PaseFacts({ face, profileId }: { face: PassFace; profileId: string }) {
  const facts = [
    { icon: Calendar, label: "Sesión", value: face.sessionLabel, href: face.sessionHref },
    { icon: User, label: "Persona", value: face.name, href: `/admin/cuentas/${profileId}` },
    { icon: Mail, label: "Correo", value: face.email, href: face.email ? `mailto:${face.email}` : "" },
    { icon: MessageCircle, label: "WhatsApp", value: face.whatsapp, href: whatsappHref(face.whatsapp) },
    { icon: Briefcase, label: "Puesto", value: face.jobTitle },
    { icon: Building2, label: "Empresa", value: face.companyName, href: face.companyHref },
    { icon: Layers, label: "Sector", value: face.sectorName, href: face.sectorHref },
    { icon: Users, label: "Tamaño", value: face.employees },
    { icon: MapPin, label: "Municipio", value: face.municipality },
    { icon: Calendar, label: "Le interesa", value: face.interest },
    { icon: Calendar, label: "Emitido", value: face.issued },
    { icon: CalendarCheck, label: "Llegada", value: face.scanner ? `${face.arrived} · ${face.scanner}` : face.arrived },
  ];
  return (
    <section className="mt-6 grid gap-3 sm:grid-cols-2">
      {facts.map((fact) => (
        <FactCard key={fact.label} {...fact} />
      ))}
    </section>
  );
}
