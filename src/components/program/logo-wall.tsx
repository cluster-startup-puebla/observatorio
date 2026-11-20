import { PixelLogoGrid } from "@/components/ui/pixel-logo-grid";
import { ProgramSection } from "./program-section";

export function LogoWall({ logos }: { logos: { name: string; src: string }[] }) {
  if (logos.length === 0) return null;
  return (
    <ProgramSection title="Quién ya participa">
      <PixelLogoGrid logos={logos} />
    </ProgramSection>
  );
}
