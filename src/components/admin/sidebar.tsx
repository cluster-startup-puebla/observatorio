"use client";

import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { logoutAdminAction } from "@/lib/admin-actions";
import { adminGroups, type AdminLink } from "@/components/admin/nav";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

function NavGroup({ name, links, path }: { name: string; links: AdminLink[]; path: string }) {
  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger>
            {name}
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton asChild isActive={path === link.href}>
                    <a href={link.href}>{link.label}</a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

export function AdminSidebar({ email }: { email: string }) {
  const path = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <p className="truncate px-2 text-sm font-semibold">Observatorio</p>
        <p className="truncate px-2 text-xs text-sidebar-foreground/70">{email}</p>
      </SidebarHeader>
      <SidebarContent>
        {adminGroups().map((group) => (
          <NavGroup key={group.name} name={group.name} links={group.links} path={path} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <form action={logoutAdminAction}>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton type="submit">Salir</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
