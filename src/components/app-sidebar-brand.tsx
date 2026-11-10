"use client";

import { AppSidebarMark } from "@/components/app-sidebar-mark";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function AppSidebarBrand({
  title,
  subtitle,
  logoSrc,
  brandColor,
}: {
  title: string;
  subtitle: string;
  logoSrc?: string;
  brandColor?: string;
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          tooltip={title}
          className="h-auto flex-col items-stretch gap-2.5 p-0 hover:bg-transparent hover:text-sidebar-foreground active:bg-transparent group-data-[collapsible=icon]:flex-row group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!"
        >
          <AppSidebarMark logoSrc={logoSrc} title={title} brandColor={brandColor} />
          <span className="grid w-full min-w-0 px-0.5 text-left group-data-[collapsible=icon]:hidden">
            <span className="truncate font-display text-base leading-tight font-semibold tracking-tight">
              {title}
            </span>
            <span className="truncate text-xs leading-4 text-sidebar-foreground/75">{subtitle}</span>
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
