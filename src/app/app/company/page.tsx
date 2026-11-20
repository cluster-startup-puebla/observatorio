import { CompanyScreen } from "@/components/app/company-screen";
import { loadCompanyHome } from "@/lib/app/load-company-home";

export const instant = false;

export default async function CompanyPage() {
  const home = await loadCompanyHome();
  return <CompanyScreen home={home} />;
}
