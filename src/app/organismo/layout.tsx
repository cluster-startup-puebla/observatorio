import { OrganismoNav } from "@/components/organismo/organismo-nav";
import { requireOrganismo } from "@/lib/auth/guards";
import { logoutAction } from "@/lib/auth/logout-action";

export const instant = false;

export default async function OrganismoLayout({ children }: { children: React.ReactNode }) {
  await requireOrganismo();

  return (
    <div className="container-site py-10 lg:py-14">
      <div className="grid gap-10">
        {children}
        <OrganismoNav />
        <form action={logoutAction}>
          <button type="submit" className="w-fit text-small text-link">
            Salir
          </button>
        </form>
      </div>
    </div>
  );
}
