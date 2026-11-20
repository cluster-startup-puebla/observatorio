"use client";

import { useEffect, useState } from "react";

export function useHeroNotch(active: boolean) {
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    if (!active) return;
    const node = document.getElementById("hero-sentinel");
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setLifted(!entry.isIntersecting), { threshold: 1 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [active]);

  return active && lifted;
}
