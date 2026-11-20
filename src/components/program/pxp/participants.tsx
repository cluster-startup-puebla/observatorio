import { PixelLogoGrid } from "@/components/ui/pixel-logo-grid";
import type { PublicLogo } from "@/lib/program/public-logos";
import { CompanyCta } from "./bits";
import { PxpFrame } from "./frame";

export function PxpParticipants({ logos }: { logos: PublicLogo[] }) {
  if (logos.length === 0) return null;

  return (
    <PxpFrame id="participantes" tone="sand">
      <h2 className="pxp-title max-w-[36ch] text-ink">
        Empresas que ya colaboran en el ecosistema
      </h2>
      <div className="mt-10">
        <PixelLogoGrid logos={logos} />
      </div>
      <div className="mt-10 flex flex-col items-start gap-5">
        <p className="pxp-copy text-ink">¿Quieres formar parte de ellas?</p>
        <CompanyCta />
      </div>
    </PxpFrame>
  );
}
