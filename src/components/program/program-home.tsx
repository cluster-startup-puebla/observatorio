import { PxpClose } from "@/components/program/pxp/close";
import { PxpConvergence } from "@/components/program/pxp/convergence";
import { PxpFaq } from "@/components/program/pxp/faq";
import { PxpFollow } from "@/components/program/pxp/follow";
import { PxpScreen } from "@/components/program/pxp/pxp-screen";
import { PxpObjective } from "@/components/program/pxp/objective";
import { PxpParticipants } from "@/components/program/pxp/participants";
import { PxpProblem } from "@/components/program/pxp/problem";
import { PxpStages } from "@/components/program/pxp/stages";
import { loadPublicLogos } from "@/lib/program/public-logos";

export async function ProgramHome() {
  const logos = await loadPublicLogos();
  return (
    <>
      <PxpScreen />
      <PxpProblem />
      <PxpConvergence />
      <PxpStages />
      <PxpObjective />
      <PxpParticipants logos={logos} />
      <PxpFollow />
      <PxpFaq />
      <PxpClose />
    </>
  );
}
