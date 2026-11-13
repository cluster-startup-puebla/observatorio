import { PaseSection } from "@/app/admin/empresas/[id]/pase-section";

export function QrTab({ assetId }: { assetId: string }) {
  return <PaseSection assetId={assetId || null} />;
}
