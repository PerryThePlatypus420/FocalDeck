"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { acceptInvite } from "@/app/actions/invites";
import { Button } from "@/components/ui/button";

interface AcceptInviteButtonProps {
  token: string;
}

export function AcceptInviteButton({ token }: AcceptInviteButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setIsLoading(true);
    setError(null);

    const result = await acceptInvite(token);

    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    const destination = result.projectId
      ? `/workspace/${result.workspaceId}/project/${result.projectId}`
      : `/workspace/${result.workspaceId}`;

    router.push(destination);
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}
      <Button
        type="button"
        onClick={() => void handleAccept()}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            Joining...
          </>
        ) : (
          "Accept invite"
        )}
      </Button>
    </div>
  );
}
