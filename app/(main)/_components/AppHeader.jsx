"use client";
import { useAuthContext } from "@/app/provider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import React from "react";
import { ModeToggle } from "@/components/mode-toggle";

function AppHeader() {
  const { user } = useAuthContext();
  return (
    <div className="p-3 flex justify-between items-center w-full">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="cursor-pointer" />
      </div>
      <div className="flex items-center gap-4">
        <ModeToggle />
        {user?.photoURL ? (
          <div className="relative h-10 w-10 ring-2 ring-border rounded-full overflow-hidden cursor-pointer hover:ring-primary/50 transition-all">
            <Image
              src={user.photoURL}
              alt="user"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
        )}
      </div>
    </div>
  );
}

export default AppHeader;
