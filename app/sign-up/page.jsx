"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { auth } from "@/config/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import toast from "react-hot-toast";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!termsAgreed) {
      toast.error("Please agree to the Terms and Privacy Policy");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Sign up error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("This email is already registered. Please log in.");
      } else {
        toast.error(error.message || "Failed to create account");
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
      toast.success("Signed in with Google!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error(error.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen w-full">
      <div className="flex w-full min-h-screen">
        <main className="bg-background flex p-6 md:p-12 justify-center items-center w-full lg:w-1/2">
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
                  Make your first Short
                </h1>
                <p className="text-muted-foreground text-base !mt-0">
                  Fast enough for class. Good enough to share.
                </p>
              </div>
            </div>

            <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4">
              <Input
                placeholder="Your name"
                aria-label="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-md bg-card border-input px-4 h-12"
              />
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="Email"
                  type="email"
                  aria-label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-md bg-card border-input px-4 h-12"
                />
                {email && !isValidEmail(email) && (
                  <p className="text-destructive text-xs">
                    Enter a valid email address.
                  </p>
                )}
              </div>
              <div className="relative">
                <Input
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  aria-label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-md bg-card border-input pr-12 pl-4 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="-translate-y-1/2 rounded-sm text-muted-foreground absolute top-1/2 right-3 p-2 hover:bg-accent hover:text-accent-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="terms"
                  checked={termsAgreed}
                  onCheckedChange={(checked) => setTermsAgreed(!!checked)}
                />
                <label
                  htmlFor="terms"
                  className="text-muted-foreground text-sm cursor-pointer select-none"
                >
                  I agree to the Terms and Privacy Policy
                </label>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-md bg-primary text-primary-foreground h-12 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
                Create account
              </Button>
            </form>

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
              className="rounded-md bg-card text-foreground border-input h-12 hover:bg-accent hover:text-accent-foreground flex items-center justify-center gap-2"
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

            <div className="text-center text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link
                href="/log-in"
                className="font-medium text-primary hover:underline ml-1"
              >
                Log in
              </Link>
            </div>
          </div>
        </main>

        <aside className="bg-accent hidden lg:flex relative p-12 justify-center items-center w-1/2 overflow-hidden">
          <div className="blur-3xl rounded-full bg-primary/20 absolute top-20 left-16 size-64" />
          <div className="blur-3xl rounded-full bg-chart-2/30 absolute right-20 bottom-24 size-72" />
          <div className="-rotate-6 shadow-xl rounded-3xl bg-card border border-border/50 flex relative p-3 w-72 aspect-[9/16] overflow-hidden">
            <div className="rounded-2xl bg-chart-3 flex relative size-full overflow-hidden">
              <div className="rotate-12 rounded-3xl bg-primary absolute top-12 -left-16 w-56 h-64" />
              <div className="-rotate-18 rounded-full bg-chart-4 absolute -top-[2rem] -right-[3rem] w-48 h-72" />
              <div className="-rotate-20 rounded-[3rem] bg-chart-2 absolute -bottom-[4rem] left-8 w-64 h-72" />
              <div className="rotate-12 rounded-2xl bg-chart-5 absolute -right-[2rem] bottom-16 size-48" />
              <div className="-rotate-12 rounded-lg bg-card/80 absolute top-20 left-6 w-28 h-32" />
              <div className="rotate-12 rounded-full bg-card/70 absolute top-32 right-6 size-24" />
              <div className="rounded-lg bg-foreground/50 absolute inset-x-5 bottom-6 p-4">
                <p className="font-semibold text-primary-foreground text-lg leading-tight tracking-wide !mb-0">
                  YOUR IDEA, IN MOTION.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

