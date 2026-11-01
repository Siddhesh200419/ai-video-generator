"use client";
import React, { useContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { onAuthStateChanged } from "firebase/auth";
import { Toaster } from "react-hot-toast";
import { auth } from "@/config/firebaseConfig";
import { AuthContext } from "@/_context/Authcontext";
import { CreationProvider } from "@/_context/CreationContext";

function Provider({ children }) {
  const [user, setUser] = useState();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Upsert user in Neon via our new API route
          const resp = await fetch("/api/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: firebaseUser?.displayName || firebaseUser?.email?.split("@")[0],
              email: firebaseUser?.email,
              pictureURL: firebaseUser?.photoURL,
            }),
          });
          const result = await resp.json();
          console.log("User synced:", result);
          setUser(result);
        } catch (err) {
          console.error("Error syncing user:", err);
          setUser({
            email: firebaseUser?.email,
            name: firebaseUser?.displayName || firebaseUser?.email?.split("@")[0],
            pictureURL: firebaseUser?.photoURL,
          });
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <AuthContext.Provider value={{ user, setUser }}>
        <CreationProvider>
          <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
              }}
            />
          </NextThemesProvider>
        </CreationProvider>
      </AuthContext.Provider>
    </div>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  return context;
};

export default Provider;
