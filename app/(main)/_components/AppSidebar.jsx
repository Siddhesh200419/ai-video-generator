"use client";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  CircleHelp,
  SquarePen,
  UserCircle,
  Video,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/app/provider";

const MenuItems = [
  {
    title: "Create",
    url: "/script-step",
    matchUrls: [
      "/create-new-video",
      "/script-step",
      "/voice-step",
      "/captions-step",
      "/theme-step",
      "/review-step",
    ],
    icon: SquarePen,
  },
  {
    title: "My videos",
    url: "/my-videos",
    matchUrls: ["/my-videos", "/dashboard"],
    icon: Video,
  },
  {
    title: "Account",
    url: "#",
    matchUrls: ["/account"],
    icon: UserCircle,
  },
];

function AppSidebar() {
  const path = usePathname();
  const { user } = useAuthContext();
  return (
    <Sidebar className="border-r border-border/50 bg-sidebar/50 backdrop-blur-xl">
      <SidebarHeader className="pb-6">
        <Link href="/" className="cursor-pointer">
          <div className="flex items-center w-full justify-start px-4 mt-6 mb-2 hover:opacity-80 transition-opacity">
            <span className="font-bold text-primary text-xl tracking-tight">
              ReelForge
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {MenuItems.map((menu, index) => {
                const isActive = menu.matchUrls?.includes(path) || path === menu.url;
                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        w-full justify-start h-10 px-3 rounded-lg transition-all duration-200 group
                        ${
                          isActive
                            ? "bg-accent text-primary font-medium"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }
                      `}
                    >
                      <Link
                        href={menu?.url}
                        className="flex items-center gap-3"
                      >
                        <menu.icon
                          className={`h-5 w-5 transition-colors ${
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-foreground"
                          }`}
                        />
                        <span className="text-sm">{menu?.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Link href="#" className="w-full">
          <SidebarMenuButton className="font-medium rounded-lg text-muted-foreground text-sm flex px-3 py-2.5 items-center gap-3 hover:bg-accent hover:text-foreground w-full">
            <CircleHelp className="size-5" />
            <span>Help</span>
          </SidebarMenuButton>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
