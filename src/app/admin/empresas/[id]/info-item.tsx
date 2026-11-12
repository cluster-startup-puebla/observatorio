import type { LucideIcon } from "lucide-react";

export function InfoItem({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-line p-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ink-secondary" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-xs uppercase tracking-wide text-ink-secondary">{label}</div>
        <div className="text-sm font-medium break-words text-ink">{value}</div>
      </div>
    </div>
  );
}
