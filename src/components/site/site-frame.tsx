"use client";

import { usePathname } from "next/navigation";
import { isAuthPath } from "@/components/auth/paths";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { SectionUrlSpy } from "@/components/site/section-url-spy";
import { isOrgPanelPath } from "@/lib/organismo/panel-path";

export function SiteFrame({
  children,
  orgSlug = "",
}: {
  children: React.ReactNode;
  orgSlug?: string;
}) {
  const path = usePathname();
  const panel = path.startsWith("/admin") && path !== "/admin/login" && path !== "/admin/signup";
  const orgPanel = isOrgPanelPath(path, orgSlug);
  const auth = isAuthPath(path);

  if (panel || orgPanel) {
    return (
      <main id="contenido" className="h-dvh overflow-hidden">
        {children}
      </main>
    );
  }

  if (auth) {
    return (
      <main id="contenido" className="flex min-h-dvh flex-1 flex-col">
        {children}
      </main>
    );
  }

  return (
    <>
      <SectionUrlSpy />
      <SiteHeader />
      <main id="contenido" className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
