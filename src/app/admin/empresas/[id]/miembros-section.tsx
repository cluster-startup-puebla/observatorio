import Link from "next/link";

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
  if (!member.email && !member.name) return <p className="text-sm text-ink-secondary">Sin miembros.</p>;
  return (
    <ul className="divide-y divide-line rounded-lg border border-line">
      <li className="px-4 py-3">
        <Link className="text-sm font-medium text-ink" href={`/admin/cuentas/${member.id}`}>
          {member.name || member.email}
        </Link>
        <p className="text-xs uppercase tracking-wide text-ink-secondary">{roles[member.role] ?? member.role}</p>
        <p className="text-sm text-ink-secondary">{member.email}</p>
      </li>
    </ul>
  );
}
