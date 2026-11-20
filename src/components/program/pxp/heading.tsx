import type { ReactNode } from "react";

export function PxpHeading({
  eyebrow,
  title,
  light = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  light?: boolean;
}) {
  return (
    <div>
      {eyebrow ? (
        <p className={`text-xs font-bold tracking-[0.18em] uppercase ${light ? "text-white" : "text-program-field"}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`mt-3 max-w-[18ch] text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-extrabold ${light ? "text-white" : "text-ink"}`}>
        {title}
      </h2>
      <span aria-hidden className={`mt-4 block h-0.5 w-12 ${light ? "bg-white" : "bg-program-field"}`} />
    </div>
  );
}

export function PxpItalic({ children }: { children: ReactNode }) {
  return <em className="font-serif font-normal text-program-field italic">{children}</em>;
}
