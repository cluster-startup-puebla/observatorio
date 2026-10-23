"use client";

import { useState } from "react";
import { FileText, LayoutDashboard, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { AppSidebarGroup } from "@/components/app-sidebar-group";
import { AppSidebarMark } from "@/components/app-sidebar-mark";
import { AppSidebarUser } from "@/components/app-sidebar-user";
import type { AdminLink } from "@/components/admin/nav";
import { openGroupName } from "@/components/admin/nav-match";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const icons: Record<string, React.ReactNode> = {
  Operación: <LayoutDashboard />,
  Panel: <LayoutDashboard />,
  Directorio: <Users />,
  Contenido: <FileText />,
};

export function AppSidebar({
  email,
  groups,
  title = "Observatorio",
  subtitle = "Superadmin",
  logoSrc,
}: {
  email: string;
  groups: { name: string; links: AdminLink[] }[];
  title?: string;
  subtitle?: string;
  logoSrc?: string;
}) {
  const path = usePathname();
  const matchedName = openGroupName(path, groups);
  const [override, setOverride] = useState<{ path: string; name: string | null } | null>(null);
  const openName = override?.path === path ? override.name : matchedName;

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0"
            >
              <AppSidebarMark logoSrc={logoSrc} title={title} />
              <span className="grid text-left text-sm leading-tight">
                <span className="truncate font-medium">{title}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">{subtitle}</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {groups.map((group) => (
            <AppSidebarGroup
              key={group.name}
              name={group.name}
              links={group.links}
              path={path}
              icon={icons[group.name]}
              open={openName === group.name}
              onOpenChange={(open) => setOverride({ path, name: open ? group.name : null })}
            />
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarUser email={email || "Sin sesión"} title={subtitle} />
      </SidebarFooter>
    </Sidebar>
  );
}
