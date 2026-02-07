"use client"
import React, { useContext, useEffect, useState } from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/config/firebaseConfig'
import { AuthContext } from '@/_context/Authcontext'
import { ConvexProvider, ConvexReactClient, useMutation } from "convex/react";
import { api } from '@/convex/_generated/api'

function Provider({ children }) {

    const [user, setUser] = useState();
    const createUser = useMutation(api.users.CreateNewUser);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log(user);
            if (user) {
                const result = await createUser({
                    name: user?.displayName,
                    email: user?.email,
                    pictureURL: user?.photoURL
                });
                console.log(result)
                setUser(result);
            }
        })
        return () => unsubscribe();
    }, [])
    return (
        <div>

            <AuthContext.Provider value={{ user }}>
                <NextThemesProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange>
                    {children}
                </NextThemesProvider>
            </AuthContext.Provider>

        </div>
    )
}
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    return context;
}

export default Provider