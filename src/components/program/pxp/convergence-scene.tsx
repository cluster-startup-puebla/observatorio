"use client";

import { useRef, type ReactNode } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { ConvergenceMarks } from "./convergence-marks";

export function ConvergenceScene({ children }: { children: ReactNode }) {
  const diagram = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const active = useInView(diagram, { amount: 0.6 });

  return (
    <div>
      {children}
      <div ref={diagram} className="mt-4 lg:mt-12">
        <ConvergenceMarks active={active} still={reduce === true} />
      </div>
    </div>
  );
}
