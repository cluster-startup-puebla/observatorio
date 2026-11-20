"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { currentUrl, sectionInView, sectionUrl } from "./section-url";

export function SectionUrlSpy() {
  const path = usePathname();

  useEffect(() => {
    const start = window.scrollY;
    let seen = location.hash === "";
    const pick = () => {
      if (!seen) {
        if (Math.abs(window.scrollY - start) < 8) return;
        seen = true;
      }
      const next = sectionUrl(sectionInView());
      if (currentUrl() === next) return;
      history.replaceState(history.state, "", next);
    };

    window.addEventListener("scroll", pick, { passive: true });
    return () => window.removeEventListener("scroll", pick);
  }, [path]);

  return null;
}
