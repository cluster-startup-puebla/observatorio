"use client";

import { usePathname } from "next/navigation";
import { isAuthPath } from "@/components/auth/paths";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const panel = path.startsWith("/admin") && path !== "/admin/login" && path !== "/admin/signup";
  const auth = isAuthPath(path);

  if (panel) {
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
      <SiteHeader />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
