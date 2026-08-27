import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Create an account | FocalDeck",
  description: "Create your FocalDeck account.",
};

export default function SignUpPage() {
  return <AuthForm mode="signup" />;
}
