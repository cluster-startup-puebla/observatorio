"use client";

import { PixelCanvas } from "@/components/ui/pixel-canvas";
import { cn } from "@/lib/utils";

export type PixelLogo = { name: string; src: string };

function LogoCard({ logo }: { logo: PixelLogo }) {
  return (
    <li
      className={cn(
        "group relative isolate grid h-24 place-items-center overflow-hidden border-r border-b border-line bg-surface",
        "transition-shadow duration-300 hover:z-[2]",
        "hover:shadow-[0_8px_24px_-8px_rgb(232_24_106/0.25),0_0_0_1px_rgb(232_24_106/0.4)]",
      )}
    >
      <PixelCanvas />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.src}
        alt={logo.name}
        className="relative z-[1] h-12 w-auto max-w-[70%] object-contain transition duration-300 group-hover:scale-105"
      />
    </li>
  );
}

export function PixelLogoGrid({ logos }: { logos: PixelLogo[] }) {
  if (logos.length === 0) return null;
  return (
    <ul className="grid grid-cols-2 border-t border-l border-line sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {logos.map((logo) => (
        <LogoCard key={logo.src} logo={logo} />
      ))}
    </ul>
  );
}
