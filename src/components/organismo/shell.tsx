"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { orgGroups } from "@/lib/organismo/nav";
import { OrgBrandSheet } from "@/components/organismo/brand-sheet";
import { sidebarBrandStyle } from "@/lib/organismo/brand-color";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function OrgShell({
  slug,
  name,
  email,
  logoSrc,
  brandColor,
  children,
}: {
  slug: string;
  name: string;
  email: string;
  logoSrc?: string;
  brandColor?: string;
  children: React.ReactNode;
}) {
  const brandStyle = sidebarBrandStyle(brandColor);
  return (
    <TooltipProvider>
      <OrgBrandSheet style={brandStyle} />
      <SidebarProvider style={brandStyle} className="h-dvh min-h-0 overflow-hidden">
        <AppSidebar
          email={email}
          groups={orgGroups(slug)}
          title={name}
          subtitle="Organismo"
          logoSrc={logoSrc}
          brandColor={brandColor}
          logout="home"
        />
        <SidebarInset className="min-h-0 overflow-hidden">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
            <SidebarTrigger className="size-8 rounded-lg text-ink-secondary hover:bg-surface-subtle hover:text-ink [&_svg]:size-4" />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="mx-auto w-full max-w-[2000px]">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
