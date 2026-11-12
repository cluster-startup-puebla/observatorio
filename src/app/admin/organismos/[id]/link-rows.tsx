import { CopyInviteLink } from "@/app/admin/organismos/[id]/copy-invite-link";
import type { OrganismoLink } from "@/lib/admin/organismos/link-rows";

export function LinkRows({ links }: { links: OrganismoLink[] }) {
  if (links.length === 0) {
    return <p className="text-small text-ink-muted">Todavía no hay enlaces.</p>;
  }
  return (
    <table className="w-full text-left text-small">
      <thead>
        <tr className="border-b border-line text-ink-muted">
          <th className="py-2 font-medium">Sector</th>
          <th className="py-2 font-medium">Sesión</th>
          <th className="py-2 font-medium">Creado</th>
          <th className="py-2 font-medium">
            <span className="sr-only">Copiar</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {links.map((link) => (
          <tr key={link.id} className="border-b border-line">
            <td className="py-2">{link.sector}</td>
            <td className="py-2">{link.session}</td>
            <td className="py-2">{link.created}</td>
            <td className="py-2 text-right">{link.path ? <CopyInviteLink path={link.path} /> : "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
