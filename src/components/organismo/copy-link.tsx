import { CopyLinkResult } from "@/components/organismo/copy-link-result";
import { CopyLinkSector } from "@/components/organismo/copy-link-sector";
import { CopyLinkSession } from "@/components/organismo/copy-link-session";
import { CopyLinkSubmit } from "@/components/organismo/copy-link-submit";
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
        <span data-tour="sector" className="contents">
          <CopyLinkSector sector={sector} />
        </span>
        <CopyLinkSession sessions={sessions} preferredId={preferredSessionId} />
        <span data-tour="generar" className="inline-flex pb-0.5">
          <CopyLinkSubmit
            className="h-[3.25rem] rounded-sm px-5 text-small font-semibold shadow-none hover:brightness-95 disabled:opacity-70"
            style={{ background: tone.background, color: tone.ink }}
          />
        </span>
      </form>
      <CopyLinkResult url={url} ready={ready} />
    </section>
  );
}
