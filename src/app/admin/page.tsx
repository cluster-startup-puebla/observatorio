import { redirect } from "next/navigation";
import { logoutAdminAction } from "@/lib/admin-actions";
import { getDirectory } from "@/lib/memory-directory";
import { readAccountId } from "@/lib/session";
import {
  createSupabaseAnon,
  createSupabaseWithAccess,
  readAccessToken,
  usesSupabaseAuth,
} from "@/lib/supabase/auth-session";

export const instant = false;

async function supabaseAdmin() {
  const token = await readAccessToken();
  if (!token) return null;
  const user = await createSupabaseAnon().auth.getUser(token);
  if (user.error || !user.data.user) return null;
  const profile = await createSupabaseWithAccess(token)
    .from("profiles")
    .select("role, email")
    .eq("id", user.data.user.id)
    .maybeSingle();
  if (profile.error || profile.data?.role !== "superadmin") return null;
  return { email: profile.data.email ?? user.data.user.email ?? "" };
}

export default async function AdminHomePage() {
  const account = usesSupabaseAuth()
    ? await supabaseAdmin()
    : await (async () => {
        const id = await readAccountId();
        if (!id) return null;
        const found = await getDirectory().getAccount(id);
        if (!found || found.role !== "superadmin") return null;
        return { email: found.email };
      })();
  if (!account) redirect("/admin/login");

  const rows = usesSupabaseAuth() ? [] : await getDirectory().progress();

  return (
    <div className="min-h-dvh bg-surface">
      <header className="border-b border-line">
        <div className="container-site flex flex-wrap items-center justify-between gap-4 py-4">
          <p className="font-display text-h4 text-ink">Panel</p>
          <nav className="flex flex-wrap items-center gap-4 text-small">
            <a href="/admin" className="text-ink">
              Inicio
            </a>
            <a href="/mesa" className="text-link">
              Mesa
            </a>
            <a href="/admin/correo" className="text-link">
              Correo
            </a>
            <form action={logoutAdminAction}>
              <button type="submit" className="text-link">
                Salir
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="container-site py-10">
        <h1 className="text-h1 text-ink" data-testid="panel-superadmin">
          Superadmin
        </h1>
        <p className="mt-3 text-body text-ink-secondary">{account.email}</p>
        <section className="mt-10 grid max-w-3xl gap-4">
          <h2 className="text-h3 text-ink">Avance de la metodología</h2>
          {rows.length === 0 ? (
            <p className="text-body text-ink-secondary">Todavía no hay respuestas.</p>
          ) : (
            <ul className="divide-y divide-line border border-line">
              {rows.map((row) => (
                <li key={row.personId} className="flex items-center justify-between gap-4 px-4 py-3">
                  <span>{row.personId}</span>
                  <span>{row.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
