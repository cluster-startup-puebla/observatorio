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
  const ink = light ? "text-white" : "text-ink";
  return (
    <div>
      {eyebrow ? <p className={`pxp-kicker ${light ? "text-white" : "text-program-field"}`}>{eyebrow}</p> : null}
      <h2 className={`pxp-title mt-4 max-w-[36ch] ${ink}`}>{title}</h2>
      <span aria-hidden className={`mt-4 block h-0.5 w-12 ${light ? "bg-white" : "bg-program-field"}`} />
    </div>
  );
}

export function PxpItalic({ children }: { children: ReactNode }) {
  return <span className="text-program-field">{children}</span>;
}
