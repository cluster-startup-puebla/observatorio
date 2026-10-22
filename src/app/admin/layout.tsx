import { AdminShell } from "@/components/admin/shell";
import { readSuperadmin } from "@/lib/auth/require-superadmin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const account = await readSuperadmin();
  return <AdminShell email={account?.email ?? ""}>{children}</AdminShell>;
}
