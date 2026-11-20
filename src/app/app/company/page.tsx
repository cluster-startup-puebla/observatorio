import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { CompanyScreen } from "@/components/app/company-screen";
import { CompanySkeleton } from "@/components/app/company-skeleton";
import { loadCompanyHome } from "@/lib/app/load-company-home";
import { companyTag, steadyLife } from "@/lib/app/view-cache";
import { readSessionAccount } from "@/lib/auth/session-account";

export const instant = false;

export default function CompanyPage() {
  return (
    <Suspense fallback={<CompanySkeleton />}>
      <CompanyBody />
    </Suspense>
  );
}

async function CompanyBody() {
  "use cache: private";
  cacheLife(steadyLife);
  const account = await readSessionAccount();
  if (account) cacheTag(companyTag(account.id));
  const home = await loadCompanyHome();
  return <CompanyScreen home={home} />;
}
