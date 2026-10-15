import { FaqItem } from "@/components/landing/molecules/faq-item";
import { SectionHeading } from "@/components/landing/molecules/section-heading";
import { faqs } from "@/content/landing";

export function Faq() {
  return (
    <section id="preguntas" className="scroll-mt-24 border-t border-line py-20 lg:py-28">
      <div className="container-site">
        <SectionHeading title="Preguntas frecuentes" />
        <div className="mt-8 max-w-3xl border-t border-line">
          {faqs.map((item) => (
            <FaqItem key={item.question} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
