import { SectionHeading } from "@/components/landing/molecules/section-heading";
import { forumDate, forumProgram } from "@/content/forum-public";
import { program } from "@/content/session-program";
import { ForumBenefits } from "./forum-benefits";
import { ForumSectors } from "./forum-sectors";
import { SessionFacts } from "./session-facts";

export function Session() {
  return (
    <section id="sesion" data-testid="bloque-evento" className="scroll-mt-24 container-site py-20 lg:py-28">
      <SectionHeading title="Estrategia estatal de vinculación industrial con el ecosistema de innovación." />
      <p className="text-body mt-4 max-w-2xl text-ink-secondary">{forumProgram}</p>
      <p className="text-body mt-6 text-ink">
        <span className="text-micro mr-3 uppercase text-ink-muted">Fecha</span>
        {forumDate}
      </p>
      <SessionFacts />
      <ForumBenefits />
      <ForumSectors />
      <ol className="mt-12 max-w-3xl border-t border-line">
        {program.map((item) => (
          <li key={item.time} className="grid gap-2 border-b border-line py-6 sm:grid-cols-[8.5rem_1fr] sm:gap-8">
            <p className="text-small font-semibold text-ink">{item.time}</p>
            <h3 className="text-h4 text-ink">{item.name}</h3>
          </li>
        ))}
      </ol>
    </section>
  );
}
