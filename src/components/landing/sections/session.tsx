import { Mic, QrCode, Users, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/landing/molecules/section-heading";
import { forumDate, forumProgram } from "@/content/forum-public";
import { program, type ProgramSlot } from "@/content/session-program";
import { ForumBenefits } from "./forum-benefits";
import { ForumSectors } from "./forum-sectors";
import { SessionFacts } from "./session-facts";

const icons: Record<NonNullable<ProgramSlot["icon"]>, LucideIcon> = { qr: QrCode, mic: Mic, users: Users };

function GroupFaces({ faces }: { faces: (string | null)[] }) {
  return (
    <span className="flex items-center" aria-hidden="true">
      {faces.map((src, index) =>
        src ? (
          <img key={index} src={src} alt="" className={`h-12 w-14 object-contain ${index ? "-ml-3" : ""}`} />
        ) : (
          <span
            key={index}
            className={`size-14 rounded-full border-2 border-elevated bg-surface-subtle ring-1 ring-line ${index ? "-ml-5" : ""}`}
          />
        ),
      )}
    </span>
  );
}

function ProgramMark({ item }: { item: ProgramSlot }) {
  if (item.faces?.length) return <GroupFaces faces={item.faces} />;
  if (item.mark) {
    const portrait = item.mark.includes("/ponentes/");
    return <img src={item.mark} alt="" className={portrait ? "size-14 rounded-full object-cover" : "h-12 w-14 object-contain"} />;
  }
  const Icon = item.icon ? icons[item.icon] : null;
  if (!Icon) return <span className="hidden size-14 sm:block" aria-hidden="true" />;
  return (
    <span className="grid size-14 place-items-center rounded-md border border-line bg-surface-subtle text-ink">
      <Icon className="size-6" aria-hidden="true" />
    </span>
  );
}

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
          <li
            key={item.time}
            className="grid items-center gap-4 border-b border-line py-6 sm:grid-cols-[8.5rem_6.5rem_1fr] sm:gap-6"
          >
            <p className="text-small font-semibold text-ink">{item.time}</p>
            <ProgramMark item={item} />
            <div className="min-w-0">
              <h3 className="text-h4 text-ink">{item.name}</h3>
              {item.host ? <p className="text-small mt-1 text-ink-secondary">{item.host}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
