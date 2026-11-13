import { type ReactNode } from "react";
import { RegistrosList } from "@/app/admin/registros/registros-list";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { listRegistros } from "@/lib/admin/registros/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function RegistrosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; error?: string; ok?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listRegistros(params.page);
  const notice = typeof params.error === "string" ? params.error : params.ok === "1" ? "Se aceptó y se envió el pase." : "";
  const banner: ReactNode = notice ? (
    <Alert variant={params.error ? "destructive" : "default"} className="mb-6">
      <AlertDescription>{notice}</AlertDescription>
    </Alert>
  ) : null;
  return <RegistrosList rows={data.rows} page={data.page} total={data.total} notice={notice} banner={banner} />;
}
