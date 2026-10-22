import { CopyLinkButton } from "@/components/organismo/copy-link-button";
import { copyEventLinkAction } from "@/lib/organismo/copy-link-action";
import { sectors } from "@/lib/sectors";

export function CopyLink({ url }: { url?: string }) {
  return (
    <section className="grid gap-3">
      <form action={copyEventLinkAction} className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-small text-ink-secondary">
          Sector
          <select name="sector" className="min-w-48 rounded-lg border border-line px-3 py-2" defaultValue="turismo">
            {sectors.map((sector) => (
              <option key={sector.slug} value={sector.slug}>
                {sector.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-primary">
          Copiar enlace del evento
        </button>
      </form>
      {url ? (
        <div className="flex flex-wrap items-center gap-3">
          <p data-testid="enlace-evento" className="text-small text-ink break-all">
            {url}
          </p>
          <CopyLinkButton url={url} />
        </div>
      ) : null}
    </section>
  );
}
