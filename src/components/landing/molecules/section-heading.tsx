import { Kicker } from "@/components/landing/atoms/kicker";

export function SectionHeading({
  kicker,
  title,
  description,
}: {
  kicker?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="max-w-3xl">
      {kicker ? <Kicker>{kicker}</Kicker> : null}
      <h2 className={`text-h2 text-balance text-ink ${kicker ? "mt-3" : ""}`}>{title}</h2>
      {description ? <p className="text-body-lg mt-4 text-ink-secondary">{description}</p> : null}
    </header>
  );
}
