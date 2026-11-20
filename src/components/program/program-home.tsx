import { LogoWall } from "@/components/program/logo-wall";
import { ProgramAllies } from "@/components/program/program-allies";
import { ProgramEssence } from "@/components/program/program-essence";
import { ProgramHero } from "@/components/program/program-hero";
import { ProgramHow } from "@/components/program/program-how";
import { ProgramNext } from "@/components/program/program-next";
import { ProgramStatements } from "@/components/program/program-statements";
import { loadPublicLogos } from "@/lib/program/public-logos";

export async function ProgramHome() {
  const logos = await loadPublicLogos();
  return (
    <>
      <ProgramHero />
      <ProgramEssence />
      <ProgramAllies />
      <ProgramStatements />
      <ProgramHow />
      <LogoWall logos={logos} />
      <ProgramNext />
    </>
  );
}
