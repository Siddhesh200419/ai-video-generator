"use client";
import { useAuthContext } from "@/app/provider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ModeToggle } from "@/components/mode-toggle";

function AppHeader() {
  const { user } = useAuthContext();
  return (
    <div className="p-3 flex justify-between items-center w-full border-b border-border/50">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="cursor-pointer" />
      </div>
      <div className="flex items-center gap-3">
        <Link href="/script-step">
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            Create new video
          </Button>
        </Link>
        <ModeToggle />
        {user?.pictureURL ? (
          <div className="relative h-9 w-9 ring-2 ring-border rounded-full overflow-hidden cursor-pointer hover:ring-primary/50 transition-all">
            <Image
              src={user.pictureURL}
              alt="user"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <button
            aria-label="Open account menu"
            className="font-semibold rounded-full bg-primary text-primary-foreground text-sm flex justify-center items-center size-9"
          >
            {user?.name?.slice(0, 2)?.toUpperCase() || "RF"}
          </button>
        )}
      </div>
    </div>
  );
}

export default AppHeader;
