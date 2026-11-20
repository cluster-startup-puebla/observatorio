"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { empresarioNav, isEmpresarioNavActive } from "@/lib/app/nav";

export function EmpresarioMenu() {
  const path = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenu className="gap-1">
      {empresarioNav().map((link) => {
        const Icon = link.icon;
        return (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton
              asChild
              isActive={isEmpresarioNavActive(path, link.href)}
              tooltip={link.label}
              className="group-data-[collapsible=icon]:justify-center"
            >
              <Link href={link.href} onClick={() => setOpenMobile(false)}>
                <Icon />
                <span className="group-data-[collapsible=icon]:hidden">{link.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
