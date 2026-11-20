"use client";

import { useState, useSyncExternalStore } from "react";
import { LogoColumn } from "@/components/ui/logo-column";
import { LogoStill } from "@/components/ui/logo-still";
import { logoColumns, type CarouselLogo } from "@/components/ui/logo-sets";

function subscribe(query: string, onChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function matches(query: string) {
  return window.matchMedia(query).matches;
}

export function LogoCarousel({ logos }: { logos: CarouselLogo[] }) {
  const reduce = useSyncExternalStore(
    (onChange) => subscribe("(prefers-reduced-motion: reduce)", onChange),
    () => matches("(prefers-reduced-motion: reduce)"),
    () => false,
  );
  const narrow = useSyncExternalStore(
    (onChange) => subscribe("(max-width: 639px)", onChange),
    () => matches("(max-width: 639px)"),
    () => false,
  );
  const [paused, setPaused] = useState(false);

  if (logos.length === 0) return null;
  if (reduce || narrow) return <LogoStill logos={logos} named={narrow} />;

  const columns = logoColumns(logos, 6);
  return (
    <div>
      <ul className="sr-only">
        {logos.map((logo) => (
          <li key={logo.src}>{logo.name}</li>
        ))}
      </ul>
      <div aria-hidden className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {columns.map((column, index) => (
          <LogoColumn key={column[0].src} logos={column} index={index} paused={paused} />
        ))}
      </div>
      <button
        type="button"
        className="mt-4 text-small text-ink underline underline-offset-4"
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
      >
        {paused ? "Reanudar aliados" : "Pausar aliados"}
      </button>
    </div>
  );
}
