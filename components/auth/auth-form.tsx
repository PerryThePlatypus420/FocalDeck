"use client";

import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "signin" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

const authContent = {
  signin: {
    title: "Welcome back",
    description: "Sign in to continue to your focused workspace.",
    submitLabel: "Sign in",
    alternatePrompt: "Don't have an account?",
    alternateLabel: "Sign up",
    alternateHref: "/signup",
  },
  signup: {
    title: "Create your account",
    description: "Start organizing your team's work in one clear workspace.",
    submitLabel: "Create account",
    alternatePrompt: "Already have an account?",
    alternateLabel: "Sign in",
    alternateHref: "/signin",
  },
} as const;

export function AuthForm({ mode }: AuthFormProps) {
  const content = authContent[mode];
  const isSignUp = mode === "signup";
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            FocalDeck
          </Link>
          <h1 className="mt-8 text-3xl font-semibold tracking-tight text-foreground">
            {content.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {content.description}
          </p>
        </div>

        <Card className="border-border/80 shadow-xl shadow-black/10">
          <CardContent className="p-6 sm:p-8">
          <Button type="button" variant="outline" className="h-10 w-full gap-3">
            <Image
              src="/google.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
              className="size-4"
            />
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>or continue with email</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="full-name" className="text-sm text-foreground">
                  Full name
                </Label>
                <div className="relative">
                  <UserRound
                    size={16}
                    strokeWidth={1.75}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="full-name"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Alex Morgan"
                    className="h-10 bg-background pl-9 pr-3 text-foreground"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-foreground">
                Email address
              </Label>
              <div className="relative">
                <Mail
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="h-10 bg-background pl-9 pr-3 text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm text-foreground">
                  Password
                </Label>
                {!isSignUp && (
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary transition-colors hover:text-primary/80"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <LockKeyhole
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="password"
                  name="password"
                  type={isPasswordVisible ? "text" : "password"}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  placeholder="Enter your password"
                  className="h-10 bg-background pl-9 pr-10 text-foreground"
                />
                <button
                  type="button"
                  aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                  aria-pressed={isPasswordVisible}
                  onClick={() => setIsPasswordVisible((visible) => !visible)}
                  className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  {isPasswordVisible ? (
                    <EyeOff size={16} strokeWidth={1.75} aria-hidden="true" />
                  ) : (
                    <Eye size={16} strokeWidth={1.75} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label
                  htmlFor="confirm-password"
                  className="text-sm text-foreground"
                >
                  Confirm password
                </Label>
                <div className="relative">
                  <LockKeyhole
                    size={16}
                    strokeWidth={1.75}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    className="h-10 bg-background pl-9 pr-10 text-foreground"
                  />
                  <button
                    type="button"
                    aria-label={
                      isConfirmPasswordVisible
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    aria-pressed={isConfirmPasswordVisible}
                    onClick={() =>
                      setIsConfirmPasswordVisible((visible) => !visible)
                    }
                    className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                  >
                    {isConfirmPasswordVisible ? (
                      <EyeOff size={16} strokeWidth={1.75} aria-hidden="true" />
                    ) : (
                      <Eye size={16} strokeWidth={1.75} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" className="h-10 w-full">
              {content.submitLabel}
            </Button>
          </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {content.alternatePrompt}{" "}
          <Link
            href={content.alternateHref}
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            {content.alternateLabel}
          </Link>
        </p>
      </div>
    </main>
  );
}
