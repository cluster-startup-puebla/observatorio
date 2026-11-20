import { AppCard } from "@/components/app/app-card";
import { ProfileGapDialog } from "@/components/app/profile-gap-dialog";
import { gapBar, gapCaption, type ProfileGap } from "@/lib/home/profile-gaps";

export type ProfileGapBannerProps = {
  gaps: ProfileGap[];
  email: string;
};

export function ProfileGapBanner({ gaps, email }: ProfileGapBannerProps) {
  const current = gaps[0];
  if (!current) return null;
  const steps = gaps.length;

  return (
    <AppCard className="border-0 bg-brand text-on-brand shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-small font-normal text-on-brand/80">Completa tu perfil</h2>
          <p className="mt-2 font-display text-h1 leading-none">
            1<span className="text-on-brand/70"> / {steps}</span>
          </p>
          <p className="mt-2 text-small text-on-brand/80">{gapCaption(steps)}</p>
        </div>
        <ProfileGapDialog gap={current} email={email} />
      </div>
      <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/30">
        <div className="h-full rounded-full bg-white" style={{ width: `${gapBar(steps)}%` }} />
      </div>
    </AppCard>
  );
}
