import Image from "next/image";

export function DocChart({
  src,
  alt,
  caption,
  width,
  height,
}: {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}) {
  return (
    <figure className="grid gap-3">
      <div className="doc-chart-frame">
        <div className="doc-chart-scroll">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="doc-chart-image"
            sizes="(min-width: 1024px) 64rem, 100vw"
          />
        </div>
      </div>
      <figcaption className="grid gap-1">
        <p className="text-body font-semibold text-ink">{caption}</p>
        <p className="doc-chart-full" aria-hidden="true">
          {alt}
        </p>
      </figcaption>
    </figure>
  );
}
