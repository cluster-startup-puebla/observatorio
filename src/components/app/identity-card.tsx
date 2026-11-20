import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { personInitials } from "@/lib/app/initials";
import type { Identity } from "@/lib/app/identity";

function LogoBanner({ logo }: { logo: string | null }) {
  return (
    <div className="relative z-0 h-52 md:h-72">
      <div className="absolute inset-0 overflow-hidden bg-surface-subtle">
        {logo ? (
          <div aria-hidden className="grid h-full grid-cols-4 place-items-center gap-8 p-8 sm:grid-cols-6">
            {Array.from({ length: 12 }, (_, index) => (
              <Image key={index} src={logo} alt="" width={160} height={80} unoptimized className="max-h-16 w-full object-contain md:max-h-24" />
            ))}
          </div>
        ) : null}
      </div>
      <div aria-hidden className="absolute right-0 bottom-0 left-28 h-0.5 bg-ink/20 md:left-36" />
    </div>
  );
}

function Mark({ name, logo, className }: { name: string; logo: string | null; className: string }) {
  if (logo) {
    return <Image src={logo} alt="" width={56} height={56} unoptimized className={className} />;
  }
  return (
    <span className={`inline-flex items-center justify-center font-display text-ink ${className}`}>
      {personInitials(name)}
    </span>
  );
}

export function IdentityCard({ person }: { person: Identity }) {
  const name = person.name || "Tu perfil";
  const role = person.job && person.company ? `${person.job} en ${person.company}` : person.job || person.company;
  const rows = [
    person.whatsapp ? { label: "WhatsApp", value: person.whatsapp } : null,
    person.email ? { label: "Correo", value: person.email } : null,
  ].flatMap((row) => (row ? [row] : []));

  return (
    <article className="overflow-hidden md:card">
      <LogoBanner logo={person.logoUrl} />
      <div className="pb-2 md:px-8 md:pb-8">
        <div className="relative z-20 -mt-14 flex flex-col gap-4 sm:flex-row sm:items-start">
          <Mark
            name={name}
            logo={null}
            className="relative z-20 size-28 rounded-full border-2 border-ink/40 bg-elevated text-h3"
          />
          <div className="min-w-0 pb-1 sm:mt-16">
            <h1 className="font-display text-h2 text-ink">{name}</h1>
            {role ? <p className="mt-1 text-body text-ink-secondary">{role}</p> : null}
          </div>
        </div>
        {rows.length ? (
          <dl className="mt-8 grid gap-4">
            {rows.map((row) => (
              <div key={row.label}>
                <dt className="text-micro text-ink-secondary">{row.label}</dt>
                <dd className="mt-1 text-body text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {person.company ? (
          <section className="mt-10 border-t border-line pt-8">
            <h2 className="font-display text-h4 text-ink">Empresa</h2>
            <Link href="/app/company" className="group mt-5 flex items-center gap-4">
              <Mark
                name={person.company}
                logo={person.logoUrl}
                className="size-14 shrink-0 rounded-full border-2 border-ink/40 bg-elevated object-contain p-1"
              />
              <span className="min-w-0 flex-1 text-body text-ink group-hover:text-brand">{person.company}</span>
              <ChevronRight aria-hidden className="size-4 shrink-0 text-ink-muted" />
            </Link>
          </section>
        ) : null}
      </div>
    </article>
  );
}
