import { Kicker } from "@/components/landing/atoms/kicker";

export function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="doc-section scroll-mt-24 border-t border-line py-10 sm:py-16 lg:py-20">
      <div className="container-site doc-wrap grid gap-6 sm:gap-8">
        <header>
          <Kicker>Sección {number}</Kicker>
          <h2 className="text-h2 mt-3 text-balance text-ink">{title}</h2>
        </header>
        <div className="doc-prose grid gap-6 text-ink-secondary sm:gap-8">{children}</div>
      </div>
    </section>
  );
}
