import { PxpAllies } from "@/components/program/pxp/allies";
import { PxpAudiences } from "@/components/program/pxp/audiences";
import { PxpClose } from "@/components/program/pxp/close";
import { PxpConvergence } from "@/components/program/pxp/convergence";
import { PxpFaq } from "@/components/program/pxp/faq";
import { PxpFollow } from "@/components/program/pxp/follow";
import { PxpHero } from "@/components/program/pxp/hero";
import { PxpListen } from "@/components/program/pxp/listen";
import { PxpMvp } from "@/components/program/pxp/mvp";
import { PxpObjective } from "@/components/program/pxp/objective";
import { PxpObservatory } from "@/components/program/pxp/observatory";
import { PxpParticipants } from "@/components/program/pxp/participants";
import { PxpProblem } from "@/components/program/pxp/problem";
import { PxpStages } from "@/components/program/pxp/stages";
import { loadPublicLogos } from "@/lib/program/public-logos";

export async function ProgramHome() {
  const logos = await loadPublicLogos();
  return (
    <>
      <PxpHero />
      <PxpProblem />
      <PxpConvergence />
      <PxpStages />
      <PxpListen />
      <PxpObservatory />
      <PxpMvp />
      <PxpAudiences />
      <PxpObjective />
      <PxpAllies />
      <PxpParticipants logos={logos} />
      <PxpFollow />
      <PxpFaq />
      <PxpClose />
    </>
  );
}
