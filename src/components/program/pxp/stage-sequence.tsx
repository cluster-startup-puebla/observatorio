"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function StageSequence({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.classList.add("is-in");
      return;
    }

    const play = () => {
      node.classList.remove("is-in");
      void node.offsetWidth;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => node.classList.add("is-in"));
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          node.classList.remove("is-in");
          return;
        }
        play();
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <ol ref={ref} className="stage-seq mt-8 grid gap-6 lg:mt-12 lg:grid-cols-3 lg:gap-8">
      {children}
    </ol>
  );
}
