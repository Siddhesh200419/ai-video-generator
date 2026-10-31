"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/config/firebaseConfig";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import toast from "react-hot-toast";

export default function LogIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Sign in error:", error);
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.message || "Failed to log in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error(error.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address first");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error) {
      toast.error(error.message || "Failed to send reset email");
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen w-full">
      <div className="grid grid-cols-1 lg:grid-cols-20 min-h-screen">
        <section className="bg-background flex p-6 md:p-12 justify-center items-center lg:col-span-9">
          <div className="flex flex-col gap-8 w-full max-w-md">
            <div className="flex flex-col gap-6">
              <Link
                href="/"
                className="font-bold text-primary text-xl tracking-tight"
              >
                ReelForge
              </Link>
              <div className="flex flex-col gap-2">
                <h1 className="font-semibold text-foreground text-3xl tracking-tight !mb-0">
                  Welcome back
                </h1>
                <p className="text-muted-foreground text-base !mt-0">
                  Pick up where your next Short left off.
                </p>
              </div>
            </div>

            <form onSubmit={handleEmailSignIn} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="font-medium text-foreground text-sm"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-md h-12"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="font-medium text-foreground text-sm"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-md pr-12 h-12"
                  />
                  <button
                    type="button"
                    aria-label="Show or hide password"
                    onClick={() => setShowPassword(!showPassword)}
                    className="-translate-y-1/2 rounded-sm text-muted-foreground flex absolute top-1/2 right-3 p-2 justify-center items-center hover:bg-accent hover:text-accent-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="rounded-md bg-primary text-primary-foreground h-12 disabled:opacity-50"
              >
                {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
                Continue
              </Button>

              <div className="flex items-center gap-4">
                <div className="bg-border flex-1 h-px" />
                <span className="text-muted-foreground text-sm">or</span>
                <div className="bg-border flex-1 h-px" />
              </div>

              <Button
                variant="outline"
                type="button"
                disabled={googleLoading}
                onClick={handleGoogleSignIn}
                className="rounded-md bg-card text-card-foreground border-border h-12 hover:bg-accent hover:text-accent-foreground flex items-center justify-center gap-2"
              >
                {googleLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="underline-offset-4 font-medium text-primary text-sm self-center hover:underline"
              >
                Forgot password?
              </button>
            </form>

            <div className="text-center text-muted-foreground text-sm">
              New here?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-primary hover:underline ml-1"
              >
                Create an account
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-foreground text-background hidden lg:flex relative px-20 py-16 justify-center items-center lg:col-span-11 min-h-screen overflow-hidden">
          <div className="bg-muted/10 absolute inset-0" />
          <div className="blur-3xl rounded-full bg-primary/20 absolute top-1/4 left-1/4 size-96" />
          <div className="blur-3xl rounded-full bg-primary/10 absolute right-1/4 bottom-1/4 size-80" />
          <div className="opacity-30 flex absolute inset-y-0 left-24 gap-16">
            <div className="border-y-primary/20 border-r-primary/20 border-l border-l-primary/20 h-full" />
            <div className="border-y-primary/10 border-r-primary/10 border-l border-l-primary/10 h-full" />
            <div className="border-y-primary/20 border-r-primary/20 border-l border-l-primary/20 h-full" />
            <div className="border-y-primary/10 border-r-primary/10 border-l border-l-primary/10 h-full" />
          </div>
          <div className="opacity-30 flex absolute inset-y-0 right-24 gap-16">
            <div className="border-y-primary/10 border-r-primary/10 border-l border-l-primary/10 h-full" />
            <div className="border-y-primary/20 border-r-primary/20 border-l border-l-primary/20 h-full" />
            <div className="border-y-primary/10 border-r-primary/10 border-l border-l-primary/10 h-full" />
            <div className="border-y-primary/20 border-r-primary/20 border-l border-l-primary/20 h-full" />
          </div>
          <div className="flex relative z-10 items-center gap-20">
            <div className="flex flex-col gap-6 max-w-md">
              <div className="bg-primary w-16 h-px" />
              <h2 className="font-semibold text-background text-4xl leading-tight tracking-tight !mb-0">
                From blank page to publish-ready in minutes.
              </h2>
            </div>
            <div className="shadow-2xl rounded-3xl bg-card border border-background/20 relative p-3 w-64 overflow-hidden">
              <div className="rounded-2xl bg-gradient-to-b from-primary/40 via-destructive/50 to-foreground relative aspect-[9/16] overflow-hidden">
                <div className="bg-gradient-to-t from-foreground/80 via-primary/20 to-transparent absolute inset-x-0 bottom-0 h-2/3" />
                <div className="-rotate-12 rounded-[50%] bg-destructive/70 absolute bottom-16 -left-1/5 w-[140%] h-32" />
                <div className="rotate-8 rounded-[50%] bg-primary/70 absolute -bottom-[12%] -left-[30%] w-[160%] h-44" />
                <div className="uppercase rounded-full text-background/80 text-[10px] tracking-[0.2em] border border-background/30 absolute top-4 left-4 px-3 py-1">
                  9:16
                </div>
                <div className="font-semibold text-center bg-foreground/50 text-background text-xs leading-tight tracking-[0.16em] absolute inset-x-4 bottom-5 p-3">
                  SOME STORIES HIDE IN PLAIN SIGHT
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

