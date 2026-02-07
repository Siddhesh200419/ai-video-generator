"use client";
import { auth } from "@/config/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import React from "react";

function Authentication({ children }) { // Accept children properly
  const provider = new GoogleAuthProvider();
  
  const onSigninClick = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        console.log(user);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div onClick={onSigninClick} className="cursor-pointer">
      {children} 
    </div>
  );
}

export default Authentication;
