"use client";

import { useEffect, useRef } from "react";

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  spin: number;
  angle: number;
};

function paintColor(className: string) {
  const probe = document.createElement("span");
  probe.className = className;
  document.body.append(probe);
  const color = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return color;
}

export function FinishConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const colors = ["bg-brand", "bg-navy", "bg-brand-light"].map(paintColor);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    const pieces: Piece[] = Array.from({ length: 140 }, () => ({
      x: width * 0.5 + (Math.random() - 0.5) * width * 0.4,
      y: height * 0.2,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * -8 - 2,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)] ?? colors[0],
      spin: (Math.random() - 0.5) * 0.2,
      angle: Math.random() * Math.PI,
    }));
    let frame = 0;
    let raf = 0;
    const draw = () => {
      context.clearRect(0, 0, width, height);
      for (const piece of pieces) {
        piece.vy += 0.18;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.angle += piece.spin;
        context.save();
        context.translate(piece.x, piece.y);
        context.rotate(piece.angle);
        context.fillStyle = piece.color;
        context.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
        context.restore();
      }
      frame += 1;
      if (frame < 180) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40"
      aria-hidden
    />
  );
}
