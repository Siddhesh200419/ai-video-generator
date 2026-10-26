"use client"
import React, { useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { onAuthStateChanged } from "firebase/auth"
import { Toaster } from "react-hot-toast"
import { auth } from "@/config/firebaseConfig"
import { AuthContext } from "@/_context/Authcontext"

function Provider({ children }) {

    const [user, setUser] = useState();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Upsert user in Neon via our new API route
                const resp = await fetch("/api/user", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: firebaseUser?.displayName,
                        email: firebaseUser?.email,
                        pictureURL: firebaseUser?.photoURL,
                    }),
                });
                const result = await resp.json();
                console.log("User synced:", result);
                setUser(result);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <div>
            <AuthContext.Provider value={{ user, setUser }}>
                <NextThemesProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange>
                    {children}
                    <Toaster
                        position="top-center"
                        toastOptions={{
                            duration: 4000,
                        }}
                    />
                </NextThemesProvider>
            </AuthContext.Provider>
        </div>
    );
}

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    return context;
};

export default Provider;