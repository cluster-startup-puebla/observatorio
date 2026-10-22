"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { orgGroups } from "@/lib/organismo/nav";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function OrgShell({
  slug,
  name,
  email,
  logoSrc,
  children,
}: {
  slug: string;
  name: string;
  email: string;
  logoSrc?: string;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider className="h-dvh min-h-0 overflow-hidden">
        <AppSidebar
          email={email}
          groups={orgGroups(slug)}
          title={name}
          subtitle="Organismo"
          logoSrc={logoSrc}
        />
        <SidebarInset className="min-h-0 overflow-hidden">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
            <SidebarTrigger />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
