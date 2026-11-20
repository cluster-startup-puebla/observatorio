import Link from "next/link";
import { Clock, Lock } from "lucide-react";
import type { ReactNode } from "react";
import { companyAccountHref } from "@/content/landing";

export function DurationPill({ children }: { children: string }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-program-field bg-surface px-3 py-1.5 text-small font-bold text-ink">
      <Clock aria-hidden size={16} className="text-program-field" />
      {children}
    </p>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return <div className="border-l-[3px] border-program-field bg-sand px-6 py-5 text-body text-ink">{children}</div>;
}

export function PrivacyCallout() {
  return (
    <Callout>
      <p className="flex gap-3">
        <Lock aria-hidden className="mt-1 shrink-0 text-program-field" size={18} />
        <span>
          <strong>Tu empresa nunca aparece con nombre.</strong> Las necesidades se usan solo como estadística anónima.
          Por ejemplo: <em>“El sector muebles necesita sistemas de trazabilidad.”</em>
        </span>
      </p>
    </Callout>
  );
}

export function CompanyCta({ onPlum = false, children }: { onPlum?: boolean; children: string }) {
  const tone = onPlum ? "bg-white text-program-field" : "bg-program-field text-white";
  return (
    <Link href={companyAccountHref} className={`btn ${tone} w-full text-center sm:w-fit`}>
      {children}
    </Link>
  );
}
