import { ThemedLogo } from "@/components/landing/atoms/partner-mark";

export function SourceLogo({
  src,
  width,
  height,
  compact = false,
}: {
  src: string;
  width: number;
  height: number;
  compact?: boolean;
}) {
  return (
    <span className={compact ? "inline-flex h-4 w-8 shrink-0 items-center" : "inline-flex h-12 shrink-0 items-center justify-center"}>
      <ThemedLogo
        src={src}
        alt=""
        width={width}
        height={height}
        className={compact ? "h-4 w-auto max-w-8 object-contain" : "h-11 w-auto max-w-52 object-contain"}
      />
    </span>
  );
}
