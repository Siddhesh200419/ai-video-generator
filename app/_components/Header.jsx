"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";
import Authentication from "./Authentication";
import { useAuthContext } from "../provider";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

function Header() {
  const { user } = useAuthContext();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
        <div className="flex items-center gap-3 transition-opacity hover:opacity-80 cursor-pointer">
          <Image src={"/logo.svg"} alt="logo" width={32} height={32} />
          <h2 className="text-xl font-bold tracking-tight">Video Gen</h2>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {!user ? (
            <Authentication>
              <Button size="sm" className="transition-all duration-300 hover:ring-2 hover:ring-primary/20 hover:ring-offset-1">Get Started</Button>
            </Authentication>
          ) : (
            <div className="flex items-center gap-3.5">
              <Link href={"/dashboard"}>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Dashboard</Button>
              </Link>
              {user?.pictureURL && (
                <div className="relative h-9 w-9 ring-2 ring-border rounded-full overflow-hidden">
                  <Image
                    className="object-cover"
                    src={user?.pictureURL}
                    alt="userImage"
                    fill
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
