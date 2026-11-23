import {
  portalInviteBody,
  portalInviteCta,
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
            <a
              href={portalInviteCta.href}
              className="btn w-full bg-white text-center text-navy hover:bg-program-x sm:w-fit"
            >
              {portalInviteCta.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
