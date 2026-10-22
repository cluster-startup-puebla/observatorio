import { homeCrumb, PanelHeader } from "@/components/admin/panel-header";
import { adminGroups } from "@/components/admin/nav";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function AdminHomePage() {
  const account = await requireSuperadmin();

  return (
    <main className="px-8 py-8">
      <PanelHeader title="Panel" lead={account.email} crumbs={[homeCrumb]} testId="panel-superadmin" />
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {adminGroups().map((group) => (
          <section key={group.name} className="rounded-2xl border border-line bg-elevated p-5">
            <h2 className="text-h4 text-ink">{group.name}</h2>
            <ul className="mt-4 grid gap-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-body text-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
