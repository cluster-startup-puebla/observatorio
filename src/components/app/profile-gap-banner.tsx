import { AppCard } from "@/components/app/app-card";
import { ProfileGapForms } from "@/components/app/profile-gap-forms";
import type { ProfileGap } from "@/lib/home/profile-gaps";

export type ProfileGapBannerProps = {
  gaps: ProfileGap[];
  counter: string;
};

export function ProfileGapBanner({ gaps, counter }: ProfileGapBannerProps) {
  if (gaps.length === 0) return null;

  return (
    <AppCard>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-h3 text-ink">Completa tu perfil</h2>
        <p className="text-small font-semibold text-ink">{counter}</p>
      </div>
      <ProfileGapForms gaps={gaps} />
    </AppCard>
  );
}
