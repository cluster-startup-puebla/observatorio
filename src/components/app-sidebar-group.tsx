"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { AdminLink } from "@/components/admin/nav";
import { bestMatchingHref } from "@/components/admin/nav-match";

export function AppSidebarGroup({
  name,
  links,
  path,
  icon,
  open,
  onOpenChange,
}: {
  name: string;
  links: AdminLink[];
  path: string;
  icon: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { isMobile, setOpen, setOpenMobile, state } = useSidebar();
  const activeHref = bestMatchingHref(
    path,
    links.map((link) => link.href),
  );

  return (
    <Collapsible
      open={open}
      onOpenChange={(next) => {
        if (state === "collapsed" && !isMobile) {
          setOpen(true);
          onOpenChange(true);
          return;
        }
        onOpenChange(next);
      }}
      className="group/collapsible w-full"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={name} className="group-data-[collapsible=icon]:justify-center">
            {icon}
            <span className="group-data-[collapsible=icon]:hidden">{name}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 ease-out group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <div
          className="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:transition-none"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <SidebarMenuSub>
              {links.map((link) => (
                <SidebarMenuSubItem key={link.href}>
                  <SidebarMenuSubButton asChild isActive={link.href === activeHref}>
                    <Link href={link.href} onClick={() => setOpenMobile(false)}>
                      {link.label}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </div>
        </div>
      </SidebarMenuItem>
    </Collapsible>
  );
}
