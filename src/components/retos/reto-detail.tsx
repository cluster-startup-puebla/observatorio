import Link from "next/link";
import { RichTextView } from "@/components/challenges/rich-text-view";
import { areaLabel, isChallengeArea } from "@/lib/challenges/areas";
import type { PortalChallenge } from "@/lib/retos/load-portal";

export function RetoDetail({ row }: { row: PortalChallenge }) {
  return (
    <article className="grid max-w-3xl gap-6">
      <Link href="/retos" className="text-small text-link">
        ← Todos los retos
      </Link>
      <header className="grid gap-2">
        <h1 className="font-display text-h2 text-ink">{row.name}</h1>
        <p className="text-body text-ink-secondary">
          {row.companyLabel}
          {" · "}
          {isChallengeArea(row.area) ? areaLabel(row.area) : row.area}
          {row.urgency ? ` · Urgencia ${row.urgency}` : ""}
        </p>
      </header>
      <RichTextView html={row.descriptionHtml} />
      <section className="grid gap-2 border-t border-line pt-6">
        <h2 className="font-display text-lg font-bold text-ink">Meta de éxito</h2>
        <p className="text-body text-ink-secondary">{row.successMetric}</p>
      </section>
    </article>
  );
}
