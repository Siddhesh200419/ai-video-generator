"use client";
import { useAuthContext } from "@/app/provider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import { ModeToggle } from "@/components/mode-toggle";
import UserMenu from "@/components/UserMenu";
import { useCreationContext } from "@/_context/CreationContext";

function AppHeader() {
  const { user } = useAuthContext();
  const { resetFormData } = useCreationContext();
  return (
    <div className="p-3 flex justify-between items-center w-full border-b border-border/50">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="cursor-pointer" />
      </div>
      <div className="flex items-center gap-3">
        <Link href="/script-step">
          <Button size="sm" className="gap-2" onClick={() => resetFormData()}>
            <Plus className="size-4" />
            Create new video
          </Button>
        </Link>
        <ModeToggle />
        <UserMenu user={user} />
      </div>
    </div>
  );
}

export default AppHeader;
