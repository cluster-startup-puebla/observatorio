"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { adminGroups } from "@/components/admin/nav";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/admin/login" || path === "/admin/signup") return children;

  return (
    <TooltipProvider>
      <SidebarProvider className="h-dvh min-h-0 overflow-hidden">
        <AppSidebar email={email} groups={adminGroups()} />
        <SidebarInset className="min-h-0 overflow-hidden">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
            <SidebarTrigger className="size-8 rounded-lg text-ink-secondary hover:bg-surface-subtle hover:text-ink [&_svg]:size-4" />
          </header>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
