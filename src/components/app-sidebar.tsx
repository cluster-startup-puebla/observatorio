"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebarGroup } from "@/components/app-sidebar-group";
import { sidebarIcons } from "@/components/app-sidebar-icons";
import { AppSidebarBrand } from "@/components/app-sidebar-brand";
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
} from "@/components/ui/sidebar";

export function AppSidebar({
  email,
  groups,
  title = "Observatorio",
  subtitle = "Superadmin",
  logoSrc,
  brandColor,
}: {
  email: string;
  groups: { name: string; links: AdminLink[] }[];
  title?: string;
  subtitle?: string;
  logoSrc?: string;
  brandColor?: string;
}) {
  const path = usePathname();
  const matchedName = openGroupName(path, groups);
  const [override, setOverride] = useState<{ path: string; name: string | null } | null>(null);
  const openName = override?.path === path ? override.name : matchedName;

  return (
    <Sidebar variant="floating" collapsible="icon" style={sidebarBrandStyle(brandColor)}>
      <SidebarHeader className="border-b border-sidebar-border px-3 pt-3 pb-3">
        <AppSidebarBrand title={title} subtitle={subtitle} logoSrc={logoSrc} brandColor={brandColor} />
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
