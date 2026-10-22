"use client";

import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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
  const activeHref = bestMatchingHref(
    path,
    links.map((link) => link.href),
  );

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            {icon}
            <span>{name}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 ease-out group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none group-data-[collapsible=icon]:hidden"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <SidebarMenuSub>
              {links.map((link) => (
                <SidebarMenuSubItem key={link.href}>
                  <SidebarMenuSubButton asChild isActive={link.href === activeHref}>
                    <a href={link.href}>{link.label}</a>
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
