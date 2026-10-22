import { CopyLinkButton } from "@/components/organismo/copy-link-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { copyEventLinkAction } from "@/lib/organismo/copy-link-action";
import { sectors } from "@/lib/sectors";

export function CopyLink({ url, sector, failed }: { url?: string; sector?: string; failed?: boolean }) {
  const selected = sector && sectors.some((item) => item.slug === sector) ? sector : "turismo";

  return (
    <section className="grid max-w-3xl gap-4">
      {failed ? (
        <Alert variant="destructive">
          <AlertDescription>No se pudo generar el enlace. Intenta de nuevo.</AlertDescription>
        </Alert>
      ) : null}
      <form action={copyEventLinkAction} className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-small text-ink-secondary">
          Sector
          <select
            name="sector"
            key={selected}
            defaultValue={selected}
            className="min-w-48 rounded-lg border border-line bg-elevated px-3 py-2 text-ink"
          >
            {sectors.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-primary">
          Generar enlace
        </button>
      </form>
      {url ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <p
            data-testid="enlace-evento"
            className="min-w-0 flex-1 break-all rounded-lg border border-line bg-surface-subtle px-3 py-2 font-mono text-small text-ink"
          >
            {url}
          </p>
          <CopyLinkButton url={url} />
        </div>
      ) : (
        <p className="text-small text-ink-muted">Elige el sector y genera el enlace para compartirlo.</p>
      )}
    </section>
  );
}
