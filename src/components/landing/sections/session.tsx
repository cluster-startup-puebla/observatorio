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
    <span className="flex flex-col items-center gap-1" aria-hidden="true">
      {faces.map((src) =>
        src ? <img key={src} src={src} alt="" className="h-8 w-16 object-contain sm:h-9 sm:w-20" /> : null,
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
            className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-0.5 border-b border-line py-4 sm:grid-cols-[8.5rem_auto_minmax(0,1fr)] sm:gap-6 sm:py-6"
          >
            <p className="col-start-2 text-small font-semibold text-ink sm:col-start-1 sm:row-start-1">{item.time}</p>
            <div className="col-start-1 row-span-2 sm:col-start-2 sm:row-span-1 sm:row-start-1">
              <ProgramMark item={item} />
            </div>
            <div className="col-start-2 min-w-0 sm:col-start-3 sm:row-start-1">
              <h3 className="text-h4 text-ink">{item.name}</h3>
              {item.host ? <p className="text-small mt-1 text-ink-secondary">{item.host}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
