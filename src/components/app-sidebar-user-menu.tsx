"use client";

import { AppSidebarLogout } from "@/components/app-sidebar-logout";
import type { LogoutDoor } from "@/lib/auth/logout-door";
import {
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function UserMenu({
  email,
  title,
  initial,
  mobile,
  door,
}: {
  email: string;
  title: string;
  initial: string;
  mobile: boolean;
  door: LogoutDoor;
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
      <AppSidebarLogout door={door} />
    </DropdownMenuContent>
  );
}

export function UserMark({ initial }: { initial: string }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
      {initial}
    </span>
  );
}
