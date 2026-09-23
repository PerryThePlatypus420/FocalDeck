"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions/auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WorkspaceSummary } from "@/types/workspace";

interface SidebarNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Only one route exists today. Once /workspace/[workspaceId] grows its own
// projects/members/settings nav, those links join this list for that context.
const navItems: SidebarNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

interface SidebarProps {
  userName: string;
  userEmail: string;
  workspaces: WorkspaceSummary[];
}

export function Sidebar({ userName, userEmail, workspaces }: SidebarProps) {
  const pathname = usePathname();
  const activeWorkspace = workspaces.find((workspace) =>
    pathname.startsWith(`/workspace/${workspace.id}`),
  );

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("REDIRECT") || message.includes("redirect")) {
        return;
      }
      console.error(error);
    }
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left hover:bg-sidebar-accent"
            >
              <span className="truncate text-sm font-semibold tracking-tight">
                {activeWorkspace ? activeWorkspace.name : "FocalDeck"}
              </span>
              <ChevronsUpDown
                size={14}
                strokeWidth={1.75}
                aria-hidden="true"
                className="shrink-0 text-sidebar-foreground/50"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            {workspaces.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                No workspaces yet
              </div>
            ) : (
              workspaces.map((workspace) => (
                <DropdownMenuItem key={workspace.id} asChild>
                  <Link href={`/workspace/${workspace.id}`}>
                    {workspace.name}
                  </Link>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard">
                <LayoutDashboard size={16} strokeWidth={1.75} aria-hidden="true" />
                Dashboard
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-1 border-t border-sidebar-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1.5 text-left hover:bg-sidebar-accent"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-medium text-sidebar-primary-foreground">
                {getInitials(userName)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium">
                  {userName}
                </span>
                <span className="block truncate text-[0.6875rem] text-sidebar-foreground/60">
                  {userEmail}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>{userEmail}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => void handleSignOut()}
            >
              <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeSwitcher />
      </div>
    </aside>
  );
}

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "?";
}
