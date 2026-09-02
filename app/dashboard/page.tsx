import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard | FocalDeck",
  description: "Your FocalDeck workspace dashboard.",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get the current user's session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user, redirect to signin
  if (!user) {
    redirect("/signin");
  }

  // Get full name from user metadata (stored during signup)
  const fullName = user.user_metadata?.full_name || "User";
  const email = user.email;

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>

        {/* User Info Section */}
        <div className="mt-8 rounded-lg border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Welcome, {fullName}! 👋
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Email: {email}</p>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          ✅ Authentication is working! You're logged in.
        </p>
      </div>
    </main>
  );
}
