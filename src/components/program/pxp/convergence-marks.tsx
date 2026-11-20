"use client";

import { ConvergenceCenter } from "./convergence-center";
import { ConvergenceSide } from "./convergence-side";
import { useConvergenceMotion } from "./use-convergence-motion";

export function ConvergenceMarks({ active, still }: { active: boolean; still: boolean }) {
  const motion = useConvergenceMotion(active, still);

  return (
    <div className="grid grid-cols-2 items-start justify-items-center gap-x-3 gap-y-5 lg:grid-cols-[13rem_18rem_13rem] lg:justify-center lg:gap-x-12 lg:gap-y-10">
      <ConvergenceSide anchor={motion.industria} title="Industria local" text="Hoy, sin soluciones a sus problemas específicos." />
      <ConvergenceSide
        anchor={motion.startups}
        title="Startups"
        text="Hoy, construyen ideas sin validación."
        pale
        className="lg:col-start-3"
      />
      <div className="col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-1">
        <ConvergenceCenter
          empresasX={motion.empresasX}
          empresasY={motion.empresasY}
          b2bX={motion.b2bX}
          b2bY={motion.b2bY}
          born={motion.born}
          union={motion.union}
          empresasRef={motion.empresas}
          b2bRef={motion.b2b}
        />
      </div>
    </div>
  );
}
