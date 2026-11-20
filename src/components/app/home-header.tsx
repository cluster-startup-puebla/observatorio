import Link from "next/link";
import { LavasChip } from "@/components/app/lavas-chip";
import { personInitials } from "@/lib/app/initials";

export function HomeHeader({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="min-w-0 font-display text-small text-ink">
        Puebla<span className="text-brand">X</span>Puebla
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <LavasChip />
        <Link
          href="/app/profile"
          aria-label="Tu perfil"
          className="inline-flex size-10 items-center justify-center rounded-full border-2 border-ink/40 bg-elevated font-display text-micro text-ink"
        >
          {personInitials(name)}
        </Link>
      </div>
    </div>
  );
}
