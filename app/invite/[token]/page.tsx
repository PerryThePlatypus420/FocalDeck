import type { Metadata } from "next";
import Link from "next/link";

import { getInvitePreview } from "@/app/actions/invites";
import { createClient } from "@/lib/supabase/server";
import { AcceptInviteButton } from "@/components/invites/accept-invite-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Accept invite | FocalDeck",
};

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  const supabase = await createClient();
  const [preview, userResult] = await Promise.all([
    getInvitePreview(token),
    supabase.auth.getUser(),
  ]);
  const user = userResult.data.user;

  const redirectTarget = `/invite/${token}`;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            FocalDeck
          </Link>
        </div>

        <Card className="border-border/80 shadow-xl shadow-black/10">
          <CardContent className="flex flex-col gap-4 p-6 text-center sm:p-8">
            {!preview.valid ? (
              <>
                <h1 className="text-xl font-semibold text-foreground">
                  This invite isn&apos;t valid
                </h1>
                <p className="text-sm text-muted-foreground">
                  It may have expired or already been used. Ask whoever
                  invited you for a new link.
                </p>
                <Button asChild>
                  <Link href="/dashboard">Go to dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-xl font-semibold text-foreground">
                  You&apos;ve been invited to join{" "}
                  <span className="text-primary">{preview.workspaceName}</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  {preview.projectName
                    ? `Join the "${preview.projectName}" project as a ${roleLabel(preview.projectRole)}.`
                    : `Join as a ${roleLabel(preview.role)}.`}
                </p>

                {user ? (
                  <AcceptInviteButton token={token} />
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button asChild>
                      <Link
                        href={`/signup?redirect=${encodeURIComponent(redirectTarget)}`}
                      >
                        Create account
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link
                        href={`/signin?redirect=${encodeURIComponent(redirectTarget)}`}
                      >
                        Sign in
                      </Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function roleLabel(role: string | null): string {
  if (!role) return "member";
  return role.charAt(0).toUpperCase() + role.slice(1);
}
