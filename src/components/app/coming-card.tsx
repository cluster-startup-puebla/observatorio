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
}: {
  icon: LucideIcon;
  title: string;
  body: ReactNode;
  screen?: boolean;
  feed?: boolean;
}) {
  const content = (
    <div className="flex flex-col items-center text-center">
      <span className="badge-brand normal-case">Próximamente</span>
      <Icon aria-hidden className="mt-6 size-10 text-ink" strokeWidth={1.75} />
      <h2 className="mt-4 text-h3 text-ink">{title}</h2>
      <p className="mt-2 text-small leading-snug text-ink-secondary">{body}</p>
    </div>
  );

  if (screen) return <section className={screenCard}>{content}</section>;
  if (feed) return <section className={feedFrame}>{content}</section>;

  return <AppCard className="w-full max-w-sm md:max-w-none">{content}</AppCard>;
}
