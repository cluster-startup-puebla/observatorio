import { ConvergenceScene } from "./convergence-scene";
import { PxpFrame } from "./frame";
import { PxpHeading } from "./heading";
import { Reveal } from "./reveal";

export function PxpConvergence() {
  return (
    <PxpFrame id="programa" tone="sand">
      <ConvergenceScene>
        <Reveal>
          <PxpHeading eyebrow="La convergencia" title="Puebla x Puebla" />
          <p className="pxp-copy mt-6 text-ink">
            Hoy la industria local y las startups no se encuentran. El programa las acerca.
          </p>
        </Reveal>
      </ConvergenceScene>
    </PxpFrame>
  );
}
