"use client";

import { useState } from "react";
import Image from "next/image";
import { conveners } from "@/content/conveners";

const logos = [...conveners].sort((a, b) => a.alt.localeCompare(b.alt, "es"));

export function AllyReel() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="pxp-reel">
      <div className="overflow-hidden">
        <ul className={`pxp-marquee flex w-max gap-10 ${paused ? "is-paused" : ""}`}>
          {[0, 1].map((copy) =>
            logos.map((logo) => (
              <li key={`${copy}-${logo.src}`} className="grid h-20 w-36 place-items-center" aria-hidden={copy === 1}>
                <Image
                  src={logo.src}
                  alt={copy === 0 ? logo.alt : ""}
                  width={logo.width}
                  height={logo.height}
                  className="max-h-14 w-auto object-contain grayscale transition hover:grayscale-0"
                />
              </li>
            )),
          )}
        </ul>
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
