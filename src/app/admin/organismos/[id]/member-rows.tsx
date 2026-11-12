import { memberRoleLabel } from "@/lib/admin/organismos/member-label";

export function MemberRows({
  members,
}: {
  members: { id: string; role: string; email: string | null; full_name: string | null }[];
}) {
  if (members.length === 0) {
    return <p className="text-small text-ink-muted">Este organismo no tiene miembros.</p>;
  }
  return (
    <table className="w-full text-left text-small">
      <thead>
        <tr className="border-b border-line text-ink-muted">
          <th className="py-2 font-medium">Nombre</th>
          <th className="py-2 font-medium">Correo</th>
          <th className="py-2 font-medium">Rol</th>
        </tr>
      </thead>
      <tbody>
        {members.map((member) => (
          <tr key={member.id} className="border-b border-line">
            <td className="py-2">{member.full_name?.trim() || "Sin nombre"}</td>
            <td className="py-2">{member.email?.trim() || "Sin correo"}</td>
            <td className="py-2">{memberRoleLabel(member.role)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
