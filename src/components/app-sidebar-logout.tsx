"use client";

import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { logoutAdminAction } from "@/lib/admin-actions";
import type { LogoutDoor } from "@/lib/auth/logout-door";
import { logoutHomeAction } from "@/lib/auth/logout-home";

export function AppSidebarLogout({ door }: { door: LogoutDoor }) {
  const action = door === "home" ? logoutHomeAction : logoutAdminAction;
  return (
    <form action={action}>
      <DropdownMenuItem asChild>
        <button type="submit" className="w-full">
          <LogOut />
          Salir
        </button>
      </DropdownMenuItem>
    </form>
  );
}
