"use client";

import { useCallback, useEffect, useRef } from "react";
import { type Pixel } from "@/components/ui/pixel";
import { seedPixels } from "@/components/ui/pixel-seed";

type PixelCanvasProps = {
  gap?: number;
  speed?: number;
};

export function PixelCanvas({ gap = 5, speed = 30 }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef(0);
  const lastFrameRef = useRef(0);
  const reducedRef = useRef(false);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !wrap || !ctx) return;
    const { width, height } = wrap.getBoundingClientRect();
    canvas.width = Math.floor(width);
    canvas.height = Math.floor(height);
    pixelsRef.current = seedPixels(canvas, gap, speed, reducedRef.current);
  }, [gap, speed]);

  const animate = useCallback((mode: "appear" | "disappear") => {
    cancelAnimationFrame(animationRef.current);
    const frame = 1000 / 60;
    const loop = () => {
      animationRef.current = requestAnimationFrame(loop);
      const now = performance.now();
      const elapsed = now - lastFrameRef.current;
      if (elapsed < frame) return;
      lastFrameRef.current = now - (elapsed % frame);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const pixel of pixelsRef.current) pixel[mode](ctx);
      if (pixelsRef.current.every((pixel) => pixel.isIdle)) cancelAnimationFrame(animationRef.current);
    };
    animationRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    init();
    const resize = new ResizeObserver(() => init());
    if (wrapRef.current) resize.observe(wrapRef.current);
    const card = wrapRef.current?.parentElement;
    const enter = () => animate("appear");
    const leave = () => animate("disappear");
    card?.addEventListener("mouseenter", enter);
    card?.addEventListener("mouseleave", leave);
    const theme = new MutationObserver(() => init());
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      resize.disconnect();
      theme.disconnect();
      cancelAnimationFrame(animationRef.current);
      card?.removeEventListener("mouseenter", enter);
      card?.removeEventListener("mouseleave", leave);
    };
  }, [animate, init]);

  return (
    <div ref={wrapRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
