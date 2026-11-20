import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AppCard } from "@/components/app/app-card";
import { screenCard } from "@/components/app/screen-frame";

const feedFrame =
  "md:rounded-[2rem] md:border md:border-line md:bg-elevated md:px-6 md:py-8 md:shadow-[0_16px_40px_-12px_rgb(22_40_79/0.18)]";

export function ComingCard({
  icon: Icon,
  title,
  body,
  screen = false,
  feed = false,
  badge = "Próximamente",
  actions,
}: {
  icon: LucideIcon;
  title: string;
  body: ReactNode;
  screen?: boolean;
  feed?: boolean;
  badge?: string | false;
  actions?: ReactNode;
}) {
  const content = (
    <div className="flex flex-col items-center text-center">
      {badge ? <span className="badge-brand normal-case">{badge}</span> : null}
      <Icon
        aria-hidden
        className={`${badge ? "mt-6" : "mt-0"} size-10 text-ink`}
        strokeWidth={1.75}
      />
      <h2 className="mt-4 text-h3 text-ink">{title}</h2>
      <p className="mt-2 text-small leading-snug text-ink-secondary">{body}</p>
      {actions ? (
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2 sm:max-w-none sm:flex-row sm:justify-center">
          {actions}
        </div>
      ) : null}
    </div>
  );

  if (screen) return <section className={screenCard}>{content}</section>;
  if (feed) return <section className={feedFrame}>{content}</section>;

  return <AppCard className="w-full max-w-sm md:max-w-none">{content}</AppCard>;
}
