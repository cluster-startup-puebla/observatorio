"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";
import { logoutAdminAction } from "@/lib/admin-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

export function AppSidebarUser({ email, title }: { email: string; title: string }) {
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
          <UserMenu email={email} title={title} initial={initial} mobile={isMobile} />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function UserMenu({
  email,
  title,
  initial,
  mobile,
}: {
  email: string;
  title: string;
  initial: string;
  mobile: boolean;
}) {
  return (
    <DropdownMenuContent
      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
      side={mobile ? "bottom" : "right"}
      align="end"
      sideOffset={4}
    >
      <DropdownMenuLabel className="p-0 font-normal">
        <span className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <UserMark initial={initial} />
          <span className="grid min-w-0 flex-1 leading-tight">
            <span className="truncate font-medium">{title}</span>
            <span className="truncate text-xs text-muted-foreground">{email}</span>
          </span>
        </span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <form action={logoutAdminAction}>
        <DropdownMenuItem asChild>
          <button type="submit" className="w-full">
            <LogOut />
            Salir
          </button>
        </DropdownMenuItem>
      </form>
    </DropdownMenuContent>
  );
}

function UserMark({ initial }: { initial: string }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
      {initial}
    </span>
  );
}
