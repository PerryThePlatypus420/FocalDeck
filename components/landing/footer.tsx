import { Mail } from "lucide-react";

const footerLinks = [
  { label: "Features", href: "#features" },
  { label: "Sign in", href: "/signin" },
  { label: "Sign up", href: "/signup" },
];

export function Footer() {
  return (
    <footer id="contact" className="border-t border-border/60 bg-card/40">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <a href="#top" className="text-lg font-semibold tracking-tight">
            FocalDeck
          </a>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
            A focused workspace for organizing projects, moving work forward,
            and keeping teams aligned.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-medium text-foreground">Explore</h2>
          <nav aria-label="Footer navigation" className="mt-4 flex flex-col gap-3">
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-medium text-foreground">Get in touch</h2>
          <a
            href="mailto:hello@focaldeck.com"
            className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Mail size={16} strokeWidth={1.75} aria-hidden="true" />
            hello@focaldeck.com
          </a>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} FocalDeck. All rights reserved.</p>
          <p>Built for clearer work.</p>
        </div>
      </div>
    </footer>
  );
}
