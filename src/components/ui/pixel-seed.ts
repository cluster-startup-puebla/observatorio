import { createPixel, type Pixel } from "@/components/ui/pixel";

const LIGHT = ["#e8186a", "#ff4d93", "#16284f", "#28406f"];
const DARK = ["#ff4d93", "#ff8ab5", "#f5f6f8", "#e8186a"];

export function seedPixels(
  canvas: HTMLCanvasElement,
  gap: number,
  speed: number,
  reduced: boolean,
): Pixel[] {
  const colors = document.documentElement.dataset.theme === "dark" ? DARK : LIGHT;
  const pace = reduced ? 0 : Math.min(speed, 100) * 0.001;
  const pixels: Pixel[] = [];
  for (let x = 0; x < canvas.width; x += gap) {
    for (let y = 0; y < canvas.height; y += gap) {
      const dx = x - canvas.width / 2;
      const dy = y - canvas.height / 2;
      const color = colors[Math.floor(Math.random() * colors.length)] ?? LIGHT[0];
      const delay = reduced ? 0 : Math.hypot(dx, dy);
      pixels.push(createPixel(canvas, x, y, color, pace, delay));
    }
  }
  return pixels;
}
