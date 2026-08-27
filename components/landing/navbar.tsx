"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigationLinks = [
  { label: "Features", href: "#features" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  return (
    <header className="relative z-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 lg:px-8">
        <a href="#top" className="text-lg font-semibold tracking-tight">
          FocalDeck
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {navigationLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Button asChild variant="ghost">
              <a href="/signin">Sign in</a>
            </Button>
            <Button asChild>
              <a href="/signup">Sign up</a>
            </Button>
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(20rem,85vw)]">
            <SheetHeader>
              <SheetTitle>FocalDeck</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-2 px-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeSwitcher />
              </div>
              {navigationLinks.map((link) => (
                <SheetClose key={link.href} asChild>
                  <a
                    href={link.href}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </SheetClose>
              ))}

              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                <SheetClose asChild>
                  <Button asChild variant="ghost" className="justify-start">
                    <a href="/signin">Sign in</a>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild className="justify-start">
                    <a href="/signup">Sign up</a>
                  </Button>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
