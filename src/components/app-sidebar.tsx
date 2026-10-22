"use client";

import { useState } from "react";
import { FileText, LayoutDashboard, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { AppSidebarGroup } from "@/components/app-sidebar-group";
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
  Directorio: <Users />,
  Contenido: <FileText />,
};

export function AppSidebar({
  email,
  groups,
  title = "Observatorio",
  subtitle = "Superadmin",
}: {
  email: string;
  groups: { name: string; links: AdminLink[] }[];
  title?: string;
  subtitle?: string;
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
            <SidebarMenuButton className="h-12">
              <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-xs font-semibold text-on-brand">
                Ob
              </span>
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
