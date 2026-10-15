import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "cn";

const sedetraSize = { width: 1106, height: 253 };

/** Wide wordmarks shrink and stacked marks grow so the row shares one visual weight. */
export function opticalLogoHeight(width: number, height: number, target = 46) {
  const aspect = width / Math.max(height, 1);
  const px = target * Math.sqrt(2.4 / aspect);
  return Math.round(Math.min(target * 1.55, Math.max(target * 0.78, px)));
}

const negativeBySrc: Record<string, string> = {
  "/logos/logo-ammje.png": "/logos/logo-ammje-negativo.png",
  "/logos/logo-coparmex.png": "/logos/logo-coparmex-negativo.png",
  "/logos/logo-cinco-de-mayo.png": "/logos/logo-cinco-de-mayo-negativo.png",
  "/logos/logo-estado.svg": "/logos/logo-estado-negativo.svg",
};

export function ThemedLogo({
  src,
  alt,
  width,
  height,
  className,
  style,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  style?: CSSProperties;
}) {
  const negative = negativeBySrc[src];
  const tone = negative ? undefined : "logo-negative";

  if (src.endsWith(".svg")) {
    return (
      <>
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(tone, negative && "dark:hidden", className)}
          style={style}
        />
        {negative ? (
          <img
            src={negative}
            alt={alt}
            width={width}
            height={height}
            className={cn("hidden dark:block", className)}
            style={style}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(tone, negative && "dark:hidden", className)}
        style={style}
      />
      {negative ? (
        <Image
          src={negative}
          alt={alt}
          width={width}
          height={height}
          className={cn("hidden dark:block", className)}
          style={style}
        />
      ) : null}
    </>
  );
}

export function PartnerMark({
  name,
  src,
  alt,
  width,
  height,
  className,
  plateClassName,
  style,
}: {
  name?: string;
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  plateClassName?: string;
  style?: CSSProperties;
}) {
  if (!src) {
    return <span className="text-small font-semibold text-ink-secondary">{name}</span>;
  }

  const size =
    width && height
      ? { width, height }
      : src === "/logos/logo-sedetra.png"
        ? sedetraSize
        : null;

  if (!size) {
    return <span className="text-small font-semibold text-ink-secondary">{name ?? alt}</span>;
  }

  return (
    <span className={cn("inline-flex max-w-full items-center", plateClassName)}>
      <ThemedLogo
        src={src}
        alt={alt ?? name ?? ""}
        width={size.width}
        height={size.height}
        className={cn("h-8 w-auto sm:h-10", className)}
        style={style}
      />
    </span>
  );
}
