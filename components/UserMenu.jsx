"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { auth } from "@/config/firebaseConfig";

function UserMenu({ user }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setOpen(false);
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error(error.message || "Failed to log out");
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Open account menu"
        onClick={() => setOpen(!open)}
        className="cursor-pointer"
      >
        {user?.pictureURL ? (
          <div className="relative h-9 w-9 ring-2 ring-border rounded-full overflow-hidden hover:ring-primary/50 transition-all">
            <Image
              src={user.pictureURL}
              alt="user"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="font-semibold rounded-full bg-primary text-primary-foreground text-sm flex justify-center items-center size-9">
            {user?.name?.slice(0, 2)?.toUpperCase() || "RF"}
          </div>
        )}
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-11 z-50 w-56 rounded-lg border border-border bg-card shadow-lg p-1.5">
            <div className="px-2.5 py-2">
              <p className="font-medium text-sm truncate">
                {user?.name || "User"}
              </p>
              <p className="text-muted-foreground text-xs truncate">
                {user?.email}
              </p>
            </div>
            <div className="bg-border my-1 h-px" />
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md text-sm flex w-full items-center gap-2 px-2.5 py-2 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            >
              <LogOut className="size-4" />
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default UserMenu;
