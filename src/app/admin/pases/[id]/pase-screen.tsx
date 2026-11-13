import { LlegadaTab } from "@/app/admin/pases/[id]/llegada-tab";
import { PaseFacts } from "@/app/admin/pases/[id]/pase-facts";
import { PaseHeader } from "@/app/admin/pases/[id]/pase-header";
import { PaseNav } from "@/app/admin/pases/[id]/pase-nav";
import { QrTab } from "@/app/admin/pases/[id]/qr-tab";
import { PanelHeader, parentLabel, trailCrumbs } from "@/components/admin/panel-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { PassFace } from "@/lib/admin/pases/relations";

export function PaseScreen({
  id,
  face,
  active,
  error,
}: {
  id: string;
  face: PassFace;
  active: string;
  error?: string;
}) {
  return (
    <main className="px-8 py-8">
      <PanelHeader title={face.name} crumbs={trailCrumbs(parentLabel("/admin/pases"), "/admin/pases", face.name)} />
      <PaseHeader face={face} />
      <PaseFacts face={face} profileId={id} />
      {error ? (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <PaseNav id={id} active={active} />
      <div className="mt-6">
        {active === "llegada" ? (
          <LlegadaTab id={id} arrived={face.arrived} scanner={face.scanner} />
        ) : (
          <QrTab assetId={face.assetId} />
        )}
      </div>
    </main>
  );
}
