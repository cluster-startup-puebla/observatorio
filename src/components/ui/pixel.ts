export type Pixel = {
  x: number;
  y: number;
  color: string;
  speed: number;
  size: number;
  sizeStep: number;
  minSize: number;
  maxSizeInt: number;
  maxSize: number;
  delay: number;
  counter: number;
  counterStep: number;
  isIdle: boolean;
  isReverse: boolean;
  isShimmer: boolean;
  draw: (ctx: CanvasRenderingContext2D) => void;
  appear: (ctx: CanvasRenderingContext2D) => void;
  disappear: (ctx: CanvasRenderingContext2D) => void;
  shimmer: () => void;
};

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

export function createPixel(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  color: string,
  baseSpeed: number,
  delay: number,
): Pixel {
  const pixel: Pixel = {
    x,
    y,
    color,
    speed: rand(0.1, 0.9) * baseSpeed,
    size: 0,
    sizeStep: Math.random() * 0.4,
    minSize: 0.5,
    maxSizeInt: 2,
    maxSize: rand(0.5, 2),
    delay,
    counter: 0,
    counterStep: Math.random() * 4 + (canvas.width + canvas.height) * 0.01,
    isIdle: false,
    isReverse: false,
    isShimmer: false,
    draw(context) {
      const offset = pixel.maxSizeInt * 0.5 - pixel.size * 0.5;
      context.fillStyle = pixel.color;
      context.fillRect(pixel.x + offset, pixel.y + offset, pixel.size, pixel.size);
    },
    appear(context) {
      pixel.isIdle = false;
      if (pixel.counter <= pixel.delay) {
        pixel.counter += pixel.counterStep;
        return;
      }
      if (pixel.size >= pixel.maxSize) pixel.isShimmer = true;
      if (pixel.isShimmer) pixel.shimmer();
      else pixel.size += pixel.sizeStep;
      pixel.draw(context);
    },
    disappear(context) {
      pixel.isShimmer = false;
      pixel.counter = 0;
      if (pixel.size <= 0) {
        pixel.isIdle = true;
        return;
      }
      pixel.size -= 0.1;
      pixel.draw(context);
    },
    shimmer() {
      if (pixel.size >= pixel.maxSize) pixel.isReverse = true;
      else if (pixel.size <= pixel.minSize) pixel.isReverse = false;
      pixel.size += pixel.isReverse ? -pixel.speed : pixel.speed;
    },
  };
  return pixel;
}
