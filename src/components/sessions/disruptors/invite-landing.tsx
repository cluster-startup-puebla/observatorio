import { DisruptorsAbout } from "@/components/sessions/disruptors/about";
import { DisruptorsInviteOpen } from "@/components/sessions/disruptors/invite-open";
import { DisruptorsMoments } from "@/components/sessions/disruptors/moments";
import { DisruptorsSpeakers } from "@/components/sessions/disruptors/speakers";
import Link from "next/link";
import { disruptorsReserveCopy } from "@/content/disruptors";

type InviteBrand = { name: string; logoSrc: string | null };

export function DisruptorsInviteLanding({
  sector,
  reserveHref,
  brand,
}: {
  sector: string;
  reserveHref: string;
  brand?: InviteBrand | null;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <DisruptorsInviteOpen sector={sector} reserveHref={reserveHref} brand={brand} />
      <DisruptorsAbout />
      <DisruptorsMoments />
      <DisruptorsSpeakers />
      <section id="registro" className="scroll-mt-24 band-ink py-20">
        <div className="container-site max-w-2xl">
          <p className="text-micro tracking-[0.16em] text-program-x uppercase">Acceso cortesía</p>
          <h2 className="text-h2 mt-3 text-balance">{disruptorsReserveCopy.title}</h2>
          <p className="text-body-lg band-ink-muted mt-4">{disruptorsReserveCopy.body}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href={reserveHref} className="btn btn-on-dark">
              {disruptorsReserveCopy.cta}
            </Link>
            <Link href="/login" className="text-small band-ink-muted underline underline-offset-4">
              ¿Ya tienes cuenta? Entra
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
