import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function FactCard({
  icon: Icon,
  label,
  value,
  href,
  wide,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  wide?: boolean;
}) {
  if (!value) return null;
  const text =
    href?.startsWith("http") || href?.startsWith("mailto:") ? (
      <a href={href} className="text-sm font-medium break-words text-link">
        {value}
      </a>
    ) : href ? (
      <Link href={href} className="text-sm font-medium break-words text-link">
        {value}
      </Link>
    ) : (
      <div className="text-sm font-medium break-words text-ink">{value}</div>
    );
  return (
    <div className={`flex items-start gap-3 rounded-xl border border-line bg-elevated p-3 ${wide ? "sm:col-span-2" : ""}`}>
      <Icon className="mt-0.5 size-5 shrink-0 text-ink-secondary" />
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-ink-secondary">{label}</div>
        <div className="mt-1">{text}</div>
      </div>
    </div>
  );
}
