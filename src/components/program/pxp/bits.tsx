import Link from "next/link";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { companyAccountHref, ctaLabel } from "@/content/landing";

export function Callout({ children }: { children: ReactNode }) {
  return <div className="border-l-[3px] border-program-field bg-sand px-6 py-5">{children}</div>;
}

export function PrivacyCallout() {
  return (
    <Callout>
      <p className="flex gap-3">
        <Lock aria-hidden className="mt-1 shrink-0 text-program-field" size={18} />
        <span className="text-base leading-snug text-pretty text-ink">
          <strong className="font-semibold">Tu empresa nunca aparece con nombre.</strong> Las necesidades se usan solo como estadística anónima. Por ejemplo: “El sector muebles necesita sistemas de trazabilidad.”
        </span>
      </p>
    </Callout>
  );
}

export function CompanyCta({ onPlum = false }: { onPlum?: boolean }) {
  const tone = onPlum ? "bg-white text-program-field" : "bg-program-field text-white";
  return (
    <Link href={companyAccountHref} className={`btn ${tone} w-full text-center sm:w-fit`}>
      {ctaLabel}
    </Link>
  );
}
