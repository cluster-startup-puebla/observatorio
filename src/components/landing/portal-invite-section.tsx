import {
  portalInviteBody,
  portalInviteCtas,
  portalInviteEyebrow,
  portalInviteHeadline,
} from "@/content/portal";

export function PortalInviteSection() {
  return (
    <section id="invitacion" data-testid="portal-invite" className="bg-surface">
      <div className="container-site py-12 lg:py-16">
        <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-14">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-program-x"
          />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-10">
            <div className="max-w-2xl">
              <p className="text-micro tracking-[0.18em] text-program-x uppercase">
                {portalInviteEyebrow}
              </p>
              <h2 className="mt-3 text-balance font-display text-[clamp(1.6rem,3vw,2.25rem)] leading-[1.15] font-bold tracking-[-0.02em]">
                {portalInviteHeadline}
              </h2>
              <p className="mt-4 max-w-xl text-pretty text-body text-white/80">{portalInviteBody}</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-fit sm:flex-row">
              {portalInviteCtas.map((cta) => (
                <a
                  key={cta.href}
                  href={cta.href}
                  className={
                    cta.primary
                      ? "btn w-full bg-white text-center text-navy hover:bg-program-x sm:w-fit"
                      : "btn w-full border border-white/70 bg-transparent text-center text-white hover:bg-white/10 sm:w-fit"
                  }
                >
                  {cta.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
