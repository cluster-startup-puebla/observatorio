import { requireOrganismo } from "@/lib/auth/guards";

export const instant = false;

export default async function OrganismoLayout({ children }: { children: React.ReactNode }) {
  await requireOrganismo();
  return children;
}
