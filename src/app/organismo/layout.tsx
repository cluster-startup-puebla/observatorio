import { OrganismoNav } from "@/components/organismo/organismo-nav";

export const instant = false;

export default function OrganismoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-site py-10 lg:py-14">
      <div className="grid gap-10">
        {children}
        <OrganismoNav />
      </div>
    </div>
  );
}
