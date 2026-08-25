<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Coding preferences

- Use TypeScript throughout the project.
- Do not use `any`. Prefer explicit interfaces and types.
- Use clear, meaningful names for variables, functions, and components.
- Prefer named exports for components and utilities.
- Build reusable UI with Shadcn UI and Tailwind CSS whenever needed.
- Use Framer Motion for subtle motion and dnd-kit for drag-and-drop.
- Keep components simple, readable, and maintainable.
- Do not use emoji in code, UI text, or comments.
- Use generated Supabase types for database and API payloads when available.
- Do not manually recreate backend response types if the schema already provides them.
- When writing or modifying code, briefly explain what it does, why the approach was chosen, and any important concepts involved.
- Before using or installing a package, check its official documentation for current APIs, package names, and recommended usage.
- Prefer the latest stable official approach unless the project already uses a different version.
- Do not rely on outdated package patterns when official documentation provides a newer replacement.