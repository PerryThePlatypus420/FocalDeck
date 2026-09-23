"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoleOption {
  value: string;
  label: string;
}

type GenerateResult =
  | { success: true; url: string }
  | { success: false; error: string };

interface InviteLinkDialogProps {
  title: string;
  description: string;
  roleLabel: string;
  roleOptions: RoleOption[];
  defaultRole: string;
  onGenerate: (role: string) => Promise<GenerateResult>;
  trigger: ReactNode;
}

// Shared shell for both "invite to workspace" and "invite to project":
// pick a role, generate a copy-link, copy it. The two call sites only
// differ in the role choices and what generating a link actually does.
export function InviteLinkDialog({
  title,
  description,
  roleLabel,
  roleOptions,
  defaultRole,
  onGenerate,
  trigger,
}: InviteLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(defaultRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);

    const result = await onGenerate(role);

    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setLink(result.url);
    setIsLoading(false);
  }

  async function handleCopy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setLink(null);
      setError(null);
      setIsCopied(false);
      setRole(defaultRole);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {link ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-link">Invite link</Label>
            <div className="flex gap-2">
              <Input id="invite-link" readOnly value={link} className="flex-1" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => void handleCopy()}
                aria-label="Copy link"
              >
                {isCopied ? (
                  <Check size={16} strokeWidth={1.75} aria-hidden="true" />
                ) : (
                  <Copy size={16} strokeWidth={1.75} aria-hidden="true" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can join. It expires in 7 days.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-role">{roleLabel}</Label>
            <Select value={role} onValueChange={setRole} disabled={isLoading}>
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter>
          {link ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Done
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                  Generating...
                </>
              ) : (
                "Generate link"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
