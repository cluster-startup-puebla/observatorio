import { CalendarX2 } from "lucide-react";
import { AppCard } from "@/components/app/app-card";

export function EmptySessionCard({ label }: { label: string }) {
  return (
    <AppCard>
      <div className="flex flex-col items-center text-center">
        <CalendarX2 aria-hidden className="size-10 text-ink" strokeWidth={1.75} />
        <p className="mt-4 text-[1.05rem] leading-[1.2] font-bold text-ink">{label}</p>
      </div>
    </AppCard>
  );
}
