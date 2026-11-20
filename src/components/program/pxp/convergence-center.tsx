"use client";

import type { RefObject } from "react";
import { motion, type MotionValue } from "framer-motion";

type Shift = MotionValue<number>;

const slot = "absolute top-0 size-36 lg:size-40";
const bubble = "convergence-drift relative block size-full rounded-full";

export function ConvergenceCenter({
  empresasX,
  empresasY,
  b2bX,
  b2bY,
  born,
  union,
  empresasRef,
  b2bRef,
}: {
  empresasX: Shift;
  empresasY: Shift;
  b2bX: Shift;
  b2bY: Shift;
  born: Shift;
  union: Shift;
  empresasRef: RefObject<HTMLDivElement | null>;
  b2bRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="grid justify-items-center gap-3 text-center">
      <p className="text-xs font-bold tracking-[0.16em] text-program-field uppercase">Con Puebla x Puebla</p>
      <div className="relative h-36 w-[11.5rem] lg:h-40 lg:w-[13.25rem]">
        <span
          aria-hidden
          className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-ink/25 lg:size-20"
        />
        <div ref={empresasRef} className={`${slot} left-0`}>
          <motion.span aria-label="Empresas" className={`${bubble} z-10 bg-navy`} style={{ x: empresasX, y: empresasY, opacity: born }} />
        </div>
        <div ref={b2bRef} className={`${slot} right-0`}>
          <motion.span aria-label="Startups B2B" className={`${bubble} z-10 bg-program-field`} style={{ x: b2bX, y: b2bY, opacity: born }} />
        </div>
        <motion.span
          className="convergence-drift absolute top-1/2 left-1/2 z-20 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-surface px-2 text-center text-[0.7rem] leading-tight font-bold text-ink shadow-md lg:size-24 lg:text-xs"
          style={{ opacity: union, scale: union }}
        >
          Desarrollo regional
        </motion.span>
      </div>
      <p className="text-xs leading-5 font-bold">
        <span className="text-navy">Empresas</span>
        <span className="text-ink-muted"> · </span>
        <span className="text-program-field">Startups B2B</span>
      </p>
    </div>
  );
}
