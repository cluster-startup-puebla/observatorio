"use client";

import { useLayoutEffect, useRef } from "react";
import { animate, useMotionValue } from "framer-motion";

function unit(progress: number, start: number, end: number) {
  const t = Math.min(1, Math.max(0, (progress - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

function centerOf(node: HTMLElement) {
  const box = node.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

export function useConvergenceMotion(active: boolean, still: boolean) {
  const industria = useRef<HTMLDivElement>(null);
  const startups = useRef<HTMLDivElement>(null);
  const empresas = useRef<HTMLDivElement>(null);
  const b2b = useRef<HTMLDivElement>(null);
  const fromEmpresas = useRef({ x: 0, y: 0 });
  const fromB2b = useRef({ x: 0, y: 0 });
  const empresasX = useMotionValue(0);
  const empresasY = useMotionValue(0);
  const b2bX = useMotionValue(0);
  const b2bY = useMotionValue(0);
  const born = useMotionValue(still ? 1 : 0);
  const union = useMotionValue(still ? 1 : 0);

  useLayoutEffect(() => {
    const play = (t: number) => {
      const rest = still ? 0 : 1 - unit(t, 0.1, 0.62);
      empresasX.set(fromEmpresas.current.x * rest);
      empresasY.set(fromEmpresas.current.y * rest);
      b2bX.set(fromB2b.current.x * rest);
      b2bY.set(fromB2b.current.y * rest);
      born.set(still ? 1 : unit(t, 0, 0.18));
      union.set(still ? 1 : unit(t, 0.48, 0.74));
    };

    const measure = () => {
      if (!industria.current || !startups.current || !empresas.current || !b2b.current) return;
      const origin = centerOf(industria.current);
      const other = centerOf(startups.current);
      const meet = centerOf(empresas.current);
      const pair = centerOf(b2b.current);
      fromEmpresas.current = { x: origin.x - meet.x, y: origin.y - meet.y };
      fromB2b.current = { x: other.x - pair.x, y: other.y - pair.y };
    };

    measure();
    const controls =
      active || still
        ? animate(0, 1, { duration: still ? 0 : 1.55, ease: [0.22, 1, 0.36, 1], onUpdate: play })
        : null;
    if (!active && !still) play(0);
    const onResize = () => {
      measure();
      play(active || still ? 1 : 0);
    };
    window.addEventListener("resize", onResize);
    return () => {
      controls?.stop();
      window.removeEventListener("resize", onResize);
    };
  }, [active, b2bX, b2bY, born, empresasX, empresasY, still, union]);

  return { industria, startups, empresas, b2b, empresasX, empresasY, b2bX, b2bY, born, union };
}
