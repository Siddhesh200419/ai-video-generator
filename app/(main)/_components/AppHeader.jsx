"use client";
import { useAuthContext } from "@/app/provider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import React from "react";

function AppHeader() {
  const { user } = useAuthContext();
  return (
    <div className="p-3 flex justify-between items-center">
      <SidebarTrigger />
      {user?.photoURL ? (
        <Image
          src={user.photoURL}
          alt="user"
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div> // Placeholder UI
      )}
    </div>
  );
}

export default AppHeader;
