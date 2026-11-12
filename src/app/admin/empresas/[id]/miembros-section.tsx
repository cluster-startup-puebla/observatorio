import Link from "next/link";
import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const roles: Record<string, string> = {
  empresario: "Empresario",
  director: "Director",
  staff: "Equipo",
  superadmin: "Superadmin",
};

export function MiembrosSection({
  member,
}: {
  member: { id: string; name: string; email: string; role: string };
}) {
  if (!member.id) return <p className="text-sm text-ink-secondary">Sin miembros.</p>;
  const label = member.name || member.email;
  return (
    <ul className="divide-y divide-line rounded-lg border border-line">
      <li>
        <Link href={`/admin/cuentas/${member.id}`} className="flex items-center gap-3 px-4 py-3">
          <Avatar className="size-10">
            <AvatarFallback className="bg-surface-subtle text-ink">
              <User className="size-5" />
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-link">{label}</span>
            <span className="block text-xs uppercase tracking-wide text-ink-secondary">
              {roles[member.role] ?? member.role}
            </span>
            <span className="block truncate text-sm text-ink-secondary">{member.email}</span>
          </span>
        </Link>
      </li>
    </ul>
  );
}
