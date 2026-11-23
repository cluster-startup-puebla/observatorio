import { CopyLinkResult } from "@/components/organismo/copy-link-result";
import { CopyLinkSubmit } from "@/components/organismo/copy-link-submit";
import { SessionPick } from "@/components/session-pick";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { copyEventLinkAction } from "@/lib/organismo/copy-link-action";
import { sidebarInk } from "@/lib/organismo/brand-color";
import { inviteSectors } from "@/lib/sectors";

const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234b5563' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

const control =
  "h-9 appearance-none rounded-md border border-line bg-elevated bg-[length:1rem] bg-[position:right_0.75rem_center] bg-no-repeat pr-9 pl-3 text-small text-ink";

const chevronStyle = { backgroundImage: chevron };

export function CopyLink({
  url,
  sector,
  failed,
  ready,
  sessions = [],
  brandColor,
  preferredSessionId,
}: {
  url?: string;
  sector?: string;
  failed?: boolean;
  ready?: boolean;
  sessions?: { id: string; label: string }[];
  brandColor?: string;
  preferredSessionId?: string | null;
}) {
  const selected = sector && inviteSectors.some((item) => item.slug === sector) ? sector : "turismo";
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
          <select name="sector" key={selected} defaultValue={selected} data-tour="sector" className={`${control} w-full`} style={chevronStyle}>
            {inviteSectors.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <SessionPick
          sessions={sessions}
          preferredId={preferredSessionId}
          tour="sesion"
          className={`${control} w-72 max-w-full`}
          selectStyle={chevronStyle}
        />
        <span data-tour="generar" className="inline-flex">
          <CopyLinkSubmit
            className="h-9 rounded-md px-4 text-small font-semibold shadow-none hover:brightness-95 disabled:opacity-70"
            style={{ background: tone.background, color: tone.ink }}
          />
        </span>
      </form>
      <CopyLinkResult url={url} ready={ready} />
    </section>
  );
}
