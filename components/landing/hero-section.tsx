import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-6 py-24 lg:px-8">
      <BackgroundRippleEffect rows={10} cols={40} cellSize={58} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-32 bg-linear-to-t from-background to-transparent"
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="mb-6 text-sm font-medium tracking-wide text-primary">
          Project management, brought into focus
        </p>
        <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Make progress visible.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          FocalDeck gives teams a clear, focused space to organize projects,
          move work forward, and understand what needs attention.
        </p>
      </div>
    </section>
  );
}
