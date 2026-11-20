import Link from "next/link";
import { RichTextView } from "@/components/challenges/rich-text-view";
import { areaLabel, isChallengeArea } from "@/lib/challenges/areas";
import type { PortalChallenge } from "@/lib/retos/load-portal";

export function RetoDetail({ row }: { row: PortalChallenge }) {
  return (
    <article className="grid w-full max-w-4xl gap-6">
      <Link href="/retos" className="text-small text-link">
        ← Todos los retos
      </Link>
      <header className="grid gap-3">
        <h1 className="font-display text-h2 text-ink">{row.name}</h1>
        <div className="flex flex-wrap items-center gap-3">
          {row.logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.logoSrc}
              alt=""
              className="size-10 rounded-md border border-line object-contain bg-elevated"
            />
          ) : null}
          <p className="text-body text-ink-secondary">
            {row.companyLabel}
            {" · "}
            {isChallengeArea(row.area) ? areaLabel(row.area) : row.area}
            {row.urgency ? ` · Urgencia ${row.urgency}` : ""}
          </p>
        </div>
      </header>
      <RichTextView html={row.descriptionHtml} />
      <section className="grid gap-2 border-t border-line pt-6">
        <h2 className="font-display text-lg font-bold text-ink">Meta de éxito</h2>
        <p className="text-body text-ink-secondary">{row.successMetric}</p>
      </section>
    </article>
  );
}
