"use client";

import { ChevronsUpDown } from "lucide-react";
import { UserMark, UserMenu } from "@/components/app-sidebar-user-menu";
import type { LogoutDoor } from "@/lib/auth/logout-door";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

export function AppSidebarUser({
  email,
  title,
  door = "admin",
}: {
  email: string;
  title: string;
  door?: LogoutDoor;
}) {
  const { isMobile } = useSidebar();
  const initial = email.trim().charAt(0).toUpperCase() || "S";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={title}
              className="group-data-[collapsible=icon]:justify-center data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserMark initial={initial} />
              <span className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{title}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">{email}</span>
              </span>
              <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <UserMenu email={email} title={title} initial={initial} mobile={isMobile} door={door} />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
