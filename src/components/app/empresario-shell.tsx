"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { EmpresarioMenu } from "@/components/app/empresario-menu";
import { MobileNav } from "@/components/app/mobile-nav";
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

function DesktopSidebar({ email }: { email: string }) {
  const { isMobile } = useSidebar();
  if (isMobile) return null;
  return (
    <AppSidebar email={email} menu={<EmpresarioMenu />} subtitle="Empresario" logout="home" />
  );
}

export function EmpresarioShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider className="h-dvh min-h-0 overflow-hidden">
        <DesktopSidebar email={email} />
        <SidebarInset className="min-h-0 overflow-hidden bg-surface-subtle">
          <header className="hidden h-12 shrink-0 items-center gap-2 border-b px-3 md:flex">
            <SidebarTrigger className="size-8 rounded-lg text-ink-secondary hover:bg-surface-subtle hover:text-ink [&_svg]:size-4" />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-32 md:pb-6">
            <div className="w-full">{children}</div>
          </div>
        </SidebarInset>
        <MobileNav />
      </SidebarProvider>
    </TooltipProvider>
  );
}
