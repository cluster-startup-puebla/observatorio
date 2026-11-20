import type { ReactNode } from "react";

const toneClass = {
  white: "bg-surface text-ink",
  sand: "bg-sand text-ink",
  plum: "bg-program-field text-white",
} as const;

export function PxpFrame({
  id,
  tone = "white",
  children,
  className = "",
}: {
  id?: string;
  tone?: keyof typeof toneClass;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 ${toneClass[tone]} ${className}`}>
      <div className="mx-auto w-full max-w-[1200px] px-4 py-20 lg:py-28">{children}</div>
    </section>
  );
}
