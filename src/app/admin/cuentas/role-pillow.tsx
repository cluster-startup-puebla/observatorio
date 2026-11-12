import { roleLabel } from "@/lib/admin/cuentas/account-kind";

const tones: Record<string, string> = {
  empresario: "bg-sky-50 text-sky-900",
  director: "bg-violet-50 text-violet-900",
  capturista: "bg-amber-50 text-amber-900",
  invitador: "bg-emerald-50 text-emerald-900",
  moderador: "bg-slate-100 text-slate-700",
  superadmin: "bg-rose-50 text-rose-900",
};

export function RolePillow({ role }: { role: string }) {
  const tone = tones[role] ?? "bg-surface-subtle text-ink";
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>{roleLabel(role)}</span>;
}
