import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign in | FocalDeck",
  description: "Sign in to your FocalDeck workspace.",
};

export default function SignInPage() {
  return <AuthForm mode="signin" />;
}
