"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebarGroup } from "@/components/app-sidebar-group";
import { sidebarIcons } from "@/components/app-sidebar-icons";
import { AppSidebarMark, type MonochromeInk } from "@/components/app-sidebar-mark";
import { AppSidebarUser } from "@/components/app-sidebar-user";
import type { AdminLink } from "@/components/admin/nav";
import { openGroupName } from "@/components/admin/nav-match";
import { sidebarBrandStyle } from "@/lib/organismo/brand-color";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({
  email,
  groups,
  title = "Observatorio",
  subtitle = "Superadmin",
  logoSrc,
  brandColor,
  monochromeInk,
}: {
  email: string;
  groups: { name: string; links: AdminLink[] }[];
  title?: string;
  subtitle?: string;
  logoSrc?: string;
  brandColor?: string;
  monochromeInk?: MonochromeInk;
}) {
  const path = usePathname();
  const matchedName = openGroupName(path, groups);
  const [override, setOverride] = useState<{ path: string; name: string | null } | null>(null);
  const openName = override?.path === path ? override.name : matchedName;

  return (
    <Sidebar variant="floating" collapsible="icon" style={sidebarBrandStyle(brandColor)}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={title} className="group-data-[collapsible=icon]:justify-center">
              <AppSidebarMark logoSrc={logoSrc} title={title} monochromeInk={monochromeInk} />
              <span className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{title}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">{subtitle}</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="gap-1">
          {groups.map((group) => (
            <AppSidebarGroup
              key={group.name}
              name={group.name}
              links={group.links}
              path={path}
              icon={sidebarIcons[group.name]}
              open={openName === group.name}
              onOpenChange={(open) => setOverride({ path, name: open ? group.name : null })}
            />
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarUser email={email || "Sin sesión"} title={subtitle} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
