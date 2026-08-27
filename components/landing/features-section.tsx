"use client";

import {
  ArrowRight,
  ChartNoAxesCombined,
  FolderKanban,
  ListChecks,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
  preview: string;
};

const features: Feature[] = [
  {
    title: "Organize every project",
    description:
      "Give each initiative a clear home with focused projects, shared context, and an overview your team can understand at a glance.",
    icon: FolderKanban,
    preview: "projects",
  },
  {
    title: "Move work forward",
    description:
      "Turn scattered tasks into visible momentum with a Kanban workflow that makes the next step obvious.",
    icon: ListChecks,
    preview: "workflow",
  },
  {
    title: "See who owns what",
    description:
      "Keep responsibilities clear with a shared view of assignees, priorities, and the work that needs attention.",
    icon: Users,
    preview: "team",
  },
  {
    title: "Understand your momentum",
    description:
      "Turn project activity into a useful signal so teams can spot progress, bottlenecks, and changing priorities.",
    icon: ChartNoAxesCombined,
    preview: "analytics",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="border-t border-border/60 bg-card/30 px-6 py-28 lg:px-8 lg:py-36"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-wide text-primary">
            Built for focused teams
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything stays in focus.
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
            FocalDeck brings projects, tasks, and team momentum into one clear
            workspace.
          </p>
        </div>

        <div className="relative mt-20">
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-4 top-0 w-px bg-border md:left-1/2 md:-translate-x-1/2"
          />

          <div className="space-y-16 md:space-y-24">
            {features.map((feature, index) => (
              <FeatureItem
                key={feature.title}
                feature={feature}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type FeatureItemProps = {
  feature: Feature;
  index: number;
};

function FeatureItem({ feature, index }: FeatureItemProps) {
  const isReversed = index % 2 === 1;
  const Icon = feature.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative grid gap-8 pl-12 md:grid-cols-2 md:gap-20 md:pl-0"
    >
      <div
        className={cn(
          "order-2 flex flex-col justify-center md:order-1",
          isReversed && "md:order-2",
        )}
      >
        <div className="mb-5 flex size-10 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
          <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {feature.title}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          {feature.description}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
          Stay aligned <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
        </span>
      </div>

      <FeaturePreview
        type={feature.preview}
        className={cn("order-1 md:order-2", isReversed && "md:order-1")}
      />

      <span
        aria-hidden="true"
        className="absolute left-0 top-4 z-10 flex size-9 items-center justify-center rounded-full border border-primary/30 bg-background text-xs font-semibold text-primary md:left-1/2 md:-translate-x-1/2"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
    </motion.article>
  );
}

type FeaturePreviewProps = {
  type: string;
  className?: string;
};

function FeaturePreview({ type, className }: FeaturePreviewProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative min-h-56 overflow-hidden rounded-lg border border-border/80 bg-card p-5 shadow-2xl shadow-black/10",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/70 pb-4">
        <span className="size-2 rounded-full bg-primary" />
        <span className="h-2 w-24 rounded-full bg-muted" />
        <span className="ml-auto h-2 w-8 rounded-full bg-muted" />
      </div>

      {type === "projects" && (
        <div className="grid grid-cols-2 gap-3 pt-5">
          {["Launch plan", "Mobile app", "Brand refresh", "Q4 planning"].map(
            (project, index) => (
              <div key={project} className="rounded-md border border-border/70 p-3">
                <span className="mb-4 block size-5 rounded bg-primary/15" />
                <p className="text-xs font-medium text-foreground">{project}</p>
                <div className="mt-3 h-1 rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-primary/70"
                    style={{ width: `${45 + index * 12}%` }}
                  />
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {type === "workflow" && (
        <div className="flex gap-3 pt-5">
          {["Backlog", "In progress", "Done"].map((column, index) => (
            <div key={column} className="min-w-0 flex-1 space-y-2">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {column}
              </p>
              {[0, 1].map((card) => (
                <div key={card} className="rounded-md border border-border/70 p-3">
                  <div className="h-2 w-full rounded-full bg-muted" />
                  <div className="mt-3 h-1.5 w-2/3 rounded-full bg-primary/50" />
                </div>
              ))}
              {index === 1 && (
                <div className="rounded-md border border-primary/40 bg-primary/10 p-3">
                  <div className="h-2 w-4/5 rounded-full bg-primary/50" />
                  <div className="mt-3 h-1.5 w-1/2 rounded-full bg-primary/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {type === "team" && (
        <div className="space-y-3 pt-5">
          {["Product design", "Engineering", "Marketing"].map((team, index) => (
            <div
              key={team}
              className="flex items-center gap-3 rounded-md border border-border/70 p-3"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {team.charAt(0)}
              </span>
              <span className="text-xs font-medium text-foreground">{team}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {index + 3} active tasks
              </span>
            </div>
          ))}
        </div>
      )}

      {type === "analytics" && (
        <div className="flex h-36 items-end gap-3 px-4 pt-8">
          {[35, 52, 42, 70, 58, 84, 76].map((height, index) => (
            <div key={index} className="flex flex-1 flex-col justify-end gap-2">
              <span
                className={cn(
                  "rounded-t-sm bg-primary/70",
                  index === 5 && "bg-primary",
                )}
                style={{ height: `${height}%` }}
              />
              <span className="h-1 w-full rounded-full bg-muted" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
