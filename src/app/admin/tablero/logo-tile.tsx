import Link from "next/link";
import type { ShowableLogo } from "@/lib/admin/empresas/event-logos";

export function LogoTile({ logo }: { logo: ShowableLogo }) {
  return (
    <Link href={`/admin/empresas/${logo.companyId}`} className="grid gap-2 rounded-lg border border-line p-3">
      <img
        src={`/api/admin/empresas/${logo.companyId}/logo`}
        alt=""
        className={`h-12 w-full object-contain ${logo.pending ? "grayscale" : ""}`}
      />
      <span className={`truncate text-small ${logo.pending ? "text-ink-muted" : "text-ink"}`}>{logo.name}</span>
    </Link>
  );
}
