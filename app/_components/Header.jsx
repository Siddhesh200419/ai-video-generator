"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { useAuthContext } from "../provider";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import UserMenu from "@/components/UserMenu";

function Header() {
  const { user } = useAuthContext();
  return (
    <header className="bg-background border-b border-b-border flex sticky z-50 top-0 px-6 md:px-10 py-4 justify-between items-center w-full">
      <Link href="/" className="font-bold text-primary text-lg tracking-tight">
        ReelForge
      </Link>
      <nav className="flex items-center gap-4 md:gap-8">
        <a
          href="#features"
          className="font-medium text-muted-foreground text-sm hover:text-foreground hidden md:block"
        >
          Features
        </a>
        <a
          href="#how-it-works"
          className="font-medium text-muted-foreground text-sm hover:text-foreground hidden md:block"
        >
          How it works
        </a>
        <a
          href="#examples"
          className="font-medium text-muted-foreground text-sm hover:text-foreground hidden md:block"
        >
          Examples
        </a>
        <ModeToggle />
        {!user ? (
          <div className="flex items-center gap-3">
            <Link
              href="/log-in"
              className="font-medium text-muted-foreground text-sm hover:text-foreground hidden sm:block"
            >
              Log in
            </Link>
            <Link href="/sign-up">
              <span className="font-semibold rounded-full bg-primary text-primary-foreground text-sm px-5 py-2.5 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
                Start creating
              </span>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3.5">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Button>
            </Link>
            <UserMenu user={user} />
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
