"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { opticalLogoHeight } from "@/components/landing/atoms/partner-mark";
import type { CarouselLogo } from "@/components/ui/logo-sets";

const cycleMs = 2200;

export function LogoColumn({ logos, index, paused = false }: { logos: CarouselLogo[]; index: number; paused?: boolean }) {
  const [current, setCurrent] = useState(0);
  const logo = logos[current] ?? logos[0];

  useEffect(() => {
    if (paused || logos.length < 2) return;
    let interval = 0;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        setCurrent((value) => (value + 1) % logos.length);
      }, cycleMs);
    }, index * 280);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [index, logos.length, paused]);

  if (!logo) return null;

  return (
    <div className="relative h-24 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={logo.src}
          className="absolute inset-0 grid place-items-center"
          initial={{ y: "12%", opacity: 0, filter: "blur(8px)" }}
          animate={{
            y: "0%",
            opacity: 1,
            filter: "blur(0px)",
            transition: { type: "spring", stiffness: 320, damping: 28, mass: 0.8 },
          }}
          exit={{
            y: "-18%",
            opacity: 0,
            filter: "blur(6px)",
            transition: { type: "tween", ease: "easeIn", duration: 0.28 },
          }}
        >
          <Image
            src={logo.src}
            alt=""
            width={logo.width}
            height={logo.height}
            className="logo-negative w-auto max-w-[88%] object-contain"
            style={{ height: opticalLogoHeight(logo.width, logo.height, 52) }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
