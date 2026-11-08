"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../provider";

function Authentication({ children }) {
  const router = useRouter();
  const { user } = useAuthContext();

  const onSigninClick = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/sign-up");
    }
  };

  return (
    <div onClick={onSigninClick} className="cursor-pointer">
      {children}
    </div>
  );
}

export default Authentication;
