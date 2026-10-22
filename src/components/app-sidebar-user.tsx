"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";
import { logoutAdminAction } from "@/lib/admin-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function AppSidebarUser({ email, title }: { email: string; title: string }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="h-12">
              <span className="flex size-8 items-center justify-center rounded-full bg-brand text-xs text-on-brand">
                {email.slice(0, 1).toUpperCase()}
              </span>
              <span className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{title}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">{email}</span>
              </span>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <form action={logoutAdminAction}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full">
                  <LogOut />
                  Salir
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
