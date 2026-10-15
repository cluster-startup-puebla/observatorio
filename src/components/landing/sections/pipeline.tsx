import { PipeStep } from "@/components/landing/molecules/pipe-step";
import { SectionHeading } from "@/components/landing/molecules/section-heading";
import { steps } from "@/content/landing";

export function Pipeline() {
  return (
    <section id="como" className="scroll-mt-24 border-y border-line bg-surface-subtle py-20 lg:py-28">
      <div className="container-site">
        <SectionHeading title="De tu problema a tu ventaja competitiva, en 5 pasos." />
        <ol className="mt-12 border-t border-line">
          {steps.map((step, index) => (
            <PipeStep key={step.name} index={index + 1} {...step} />
          ))}
        </ol>
      </div>
    </section>
  );
}
