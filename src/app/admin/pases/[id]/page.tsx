import { notFound } from "next/navigation";
import { PaseScreen } from "@/app/admin/pases/[id]/pase-screen";
import { paseTabs } from "@/app/admin/pases/[id]/pase-nav";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadPase } from "@/lib/admin/pases/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function PaseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadPase(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, paseTabs.map((tab) => tab.value), "qr");
  return <PaseScreen id={id} face={data.face} active={active} error={query.error} />;
}
