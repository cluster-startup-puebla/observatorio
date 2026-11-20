import type { LucideIcon } from "lucide-react";
import { AppCard } from "@/components/app/app-card";

export function ComingCard({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <AppCard className="w-full max-w-sm md:max-w-none">
      <div className="flex flex-col items-center text-center">
        <span className="badge-brand normal-case">Próximamente</span>
        <Icon aria-hidden className="mt-6 size-10 text-ink" strokeWidth={1.75} />
        <h2 className="mt-4 text-h3 text-ink">{title}</h2>
        <p className="mt-2 text-small leading-snug text-ink-secondary">{body}</p>
      </div>
    </AppCard>
  );
}
