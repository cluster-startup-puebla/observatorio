import { SheetSubmit } from "@/components/admin/sheet-submit";
import { CopyLinkButton } from "@/components/organismo/copy-link-button";
import { LinkReady } from "@/components/organismo/link-ready";
import { SessionPick } from "@/components/session-pick";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { copyEventLinkAction } from "@/lib/organismo/copy-link-action";
import { sidebarInk } from "@/lib/organismo/brand-color";
import { sectors } from "@/lib/sectors";

const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234b5563' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

const control =
  "h-9 appearance-none rounded-md border border-line bg-elevated bg-[length:1rem] bg-[position:right_0.75rem_center] bg-no-repeat pr-9 pl-3 text-small text-ink";

const chevronStyle = {
  backgroundImage: chevron,
};

export function CopyLink({
  url,
  sector,
  failed,
  ready,
  sessions = [],
  brandColor,
}: {
  url?: string;
  sector?: string;
  failed?: boolean;
  ready?: boolean;
  sessions?: { id: string; label: string }[];
  brandColor?: string;
}) {
  const selected = sector && sectors.some((item) => item.slug === sector) ? sector : "turismo";
  const tone = sidebarInk(brandColor);

  return (
    <section className="grid gap-4">
      {failed ? (
        <Alert variant="destructive">
          <AlertDescription>No se pudo generar el enlace. Intenta de nuevo.</AlertDescription>
        </Alert>
      ) : null}
      <form action={copyEventLinkAction} className="flex flex-wrap items-end gap-3">
        <label className="grid w-56 max-w-full gap-1 text-small text-ink-secondary">
          Sector
          <select name="sector" key={selected} defaultValue={selected} className={`${control} w-full`} style={chevronStyle}>
            {sectors.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <SessionPick sessions={sessions} className={`${control} w-72 max-w-full`} selectStyle={chevronStyle} />
        <SheetSubmit
          pendingLabel="Generando…"
          className="h-9 rounded-md px-4 py-0 text-small shadow-none hover:brightness-95"
          style={{ background: tone.background, color: tone.ink }}
        >
          Generar enlace
        </SheetSubmit>
      </form>
      {ready && url ? <LinkReady url={url} /> : null}
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
