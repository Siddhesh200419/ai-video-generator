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
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Gem,
  HomeIcon,
  LucideFileVideo,
  Search,
  WalletCards,
  Plus
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/app/provider";

const MenuItems = [
  {
    title: "Home",
    url: "/dashboard",
    icon: HomeIcon,
  },
  {
    title: "Create New Video",
    url: "/create-new-video",
    icon: LucideFileVideo,
  },
  {
    title: "Explore",
    url: "/explore",
    icon: Search,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: WalletCards,
  },
];
function AppSidebar() {
  const path = usePathname();
  const { user } = useAuthContext();
  return (
    <Sidebar className="border-r border-border/50 bg-sidebar/50 backdrop-blur-xl">
      <SidebarHeader className="pb-6">
        <Link href="/" className="cursor-pointer">
          <div className="flex items-center gap-3 w-full justify-start px-4 mt-6 mb-2 hover:opacity-80 transition-opacity">
            <div className="relative w-8 h-8">
              <Image src={"/logo.svg"} alt="logo" fill className="object-contain" />
            </div>
            <h2 className="font-bold text-xl tracking-tight text-foreground">Video Gen</h2>
          </div>
          <p className="text-xs text-muted-foreground px-4 font-medium tracking-wide uppercase opacity-70">
            AI Video Generator
          </p>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="mx-2 mb-6">
              <Link href={"/create-new-video"}>
                <Button className="w-full shadow-md hover:shadow-primary/20 transition-all font-medium h-10">
                   <Plus className="mr-2 h-4 w-4" /> New Video
                </Button>
              </Link>
            </div>
            <SidebarMenu className="space-y-1">
              {MenuItems.map((menu, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    isActive={path == menu.url}
                    className={`
                      w-full justify-start h-10 px-3 rounded-lg transition-all duration-200 group
                      ${path == menu.url 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                    `}
                  >
                    <Link
                      href={menu?.url}
                      className="flex items-center gap-3"
                    >
                      <menu.icon className={`h-4 w-4 transition-colors ${path == menu.url ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                      <span className="text-sm">{menu?.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
               <div className="p-1.5 bg-primary/10 rounded-full">
                  <Gem className="h-3.5 w-3.5 text-primary" />
               </div>
               <span className="text-xs font-medium text-muted-foreground">Credits</span>
            </div>
            <span className="text-sm font-bold text-foreground">{user?.credits || 0}</span>
          </div>
          
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden mb-3">
             <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((user?.credits || 0) / 100 * 100, 100)}%` }}></div>
          </div>

          <Button variant="outline" size="sm" className="w-full text-xs h-8 hover:bg-primary hover:text-primary-foreground border-primary/20 hover:border-primary transition-colors">Buy Credits</Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
