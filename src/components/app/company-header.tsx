import Image from "next/image";
import { Factory, Globe, Layers, MapPin, Users, type LucideIcon } from "lucide-react";
import { AppCard } from "@/components/app/app-card";
import { personInitials } from "@/lib/app/initials";
import { companyFacts, type CompanyFact, type CompanyFactIcon } from "@/lib/app/company-facts";
import type { CompanyHome } from "@/lib/app/company-score";

const icons: Record<CompanyFactIcon, LucideIcon> = {
  sector: Layers,
  users: Users,
  globe: Globe,
  pin: MapPin,
  market: Factory,
};

function Logo({ name, logo }: { name: string; logo: string | null }) {
  if (logo) {
    return (
      <Image
        src={logo}
        alt=""
        width={80}
        height={80}
        unoptimized
        className="size-20 shrink-0 rounded-full border-2 border-ink/20 bg-surface-subtle object-contain p-1"
      />
    );
  }
  return (
    <span className="inline-flex size-20 shrink-0 items-center justify-center rounded-full border-2 border-ink/20 bg-surface-subtle font-display text-h3 text-ink">
      {personInitials(name)}
    </span>
  );
}

function place(icon: CompanyFactIcon) {
  if (icon === "globe") return "col-span-2 w-max max-w-full justify-self-start";
  if (icon === "sector" || icon === "market") return "col-span-2";
  return "h-full";
}

function Fact({ fact }: { fact: CompanyFact }) {
  const Icon = icons[fact.icon];
  const value = fact.href ? (
    <a href={fact.href} className="text-sm font-medium text-link hover:text-brand">
      {fact.value}
    </a>
  ) : (
    <div className="line-clamp-2 text-sm font-medium break-words text-ink">{fact.value}</div>
  );
  return (
    <div className={`flex items-start gap-3 rounded-xl border border-line bg-surface-subtle p-3 ${place(fact.icon)}`}>
      <Icon className="mt-0.5 size-5 shrink-0 text-ink-secondary" />
      <div className={fact.icon === "globe" ? "" : "min-w-0"}>
        <div className="text-xs uppercase tracking-wide text-ink-secondary">{fact.label}</div>
        <div className="mt-1">{value}</div>
      </div>
    </div>
  );
}

export function CompanyHeader({ home }: { home: CompanyHome }) {
  const name = home.legalName?.trim() || "Empresa";
  const sector = home.sectorName?.trim() || "";
  const facts = companyFacts(home);
  return (
    <AppCard>
      <div className="flex min-w-0 items-center gap-4">
        <Logo name={name} logo={home.logoUrl} />
        <div className="min-w-0">
          <h1 className="font-display text-h3 break-words text-ink md:text-h2">{name}</h1>
          {sector ? <p className="mt-1 text-body text-ink-secondary">{sector}</p> : null}
        </div>
      </div>
      {facts.length ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {facts.map((item) => (
            <Fact key={item.label} fact={item} />
          ))}
        </div>
      ) : null}
    </AppCard>
  );
}
