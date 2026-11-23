import { CopyLinkResult } from "@/components/organismo/copy-link-result";
import { copyLinkChevronStyle, copyLinkControl } from "@/components/organismo/copy-link-controls";
import { CopyLinkSector } from "@/components/organismo/copy-link-sector";
import { CopyLinkSubmit } from "@/components/organismo/copy-link-submit";
import { SessionPick } from "@/components/session-pick";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { copyEventLinkAction } from "@/lib/organismo/copy-link-action";
import { sidebarInk } from "@/lib/organismo/brand-color";

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
  const tone = sidebarInk(brandColor);

  return (
    <section className="grid gap-4">
      {failed ? (
        <Alert variant="destructive">
          <AlertDescription>No se pudo generar el enlace. Intenta de nuevo.</AlertDescription>
        </Alert>
      ) : null}
      <form action={copyEventLinkAction} className="flex flex-wrap items-end gap-3">
        <CopyLinkSector sector={sector} />
        <SessionPick
          sessions={sessions}
          preferredId={preferredSessionId}
          tour="sesion"
          className={`${copyLinkControl} w-72 max-w-full`}
          selectStyle={copyLinkChevronStyle}
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
