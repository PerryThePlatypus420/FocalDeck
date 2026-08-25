# FocalDeck — Design Direction

## 1. Product Vision
FocalDeck is a modern project and team workflow dashboard designed to feel sharp, focused, and premium. The overall goal is to give people a clean place to manage tasks, move work across a board, see workload, and stay organized without visual clutter.

The interface should feel like a high-end product tool: calm, structured, and efficient.

---

## 2. Design Principles
- Dark mode first, with a clean light mode option later
- Dense but readable layout
- Minimal visual noise
- Clear hierarchy and strong spacing
- Calm, premium UI with strong contrast
- Motion should feel subtle and intentional, not decorative
- The board should feel fast, fluid, and easy to scan

---

## 3. Stack & Design Tools
The design direction is built around the following stack:

- Next.js
- TypeScript
- Tailwind CSS
- Shadcn UI
- Framer Motion
- dnd-kit
- Lucide React
- Supabase for auth, realtime, and storage where relevant

These tools support a modern, focused, and consistent product experience.

---

## 4. Visual Style
### Brand vibe
- Modern
- High-density
- Crisp and structured
- Enterprise-leaning but not overly corporate
- Inspired by clean productivity tools and dark dashboard products

### Core aesthetic
- Dark surfaces with controlled contrast
- Muted cards and panels
- Strong cobalt accent highlights
- Thin borders and clean dividers
- Spacious but compact layout rhythm

---

## 5. Typography
- Primary font: Geist Sans or Inter
- Monospace font: Geist Mono or JetBrains Mono

### Suggested scale
- Page title: 24px, 700
- Section headers: 18px, 600
- Card titles: 14px, 500
- Body text: 14px, 400
- Metadata: 12px, 400

The interface should prioritize clarity and density without feeling cramped.

---

## 6. Color System
### Dark mode (default)
- Background: #090d16
- Surface: #0e1422
- Surface elevated: #161e31
- Primary accent: #3b82f6
- Text primary: #f8fafc
- Text muted: #94a3b8
- Border: #1e293b

### Light mode (secondary)
- Background: #f8fafc
- Surface: #ffffff
- Primary accent: #2563eb
- Text primary: #0f172a
- Text muted: #64748b
- Border: #e2e8f0

### Status colors
- Urgent: red
- High: orange
- Medium: amber
- Low: slate blue
- Completed / healthy: emerald
- At risk: rose

These should be used as soft status pills, not loud full-color blocks.

---

## 7. Layout & Components
### General layout rules
- Keep surfaces separated with subtle borders
- Use rounded corners for cards and inputs
- Use a dense desktop layout first
- Preserve strong visual hierarchy between sidebar, content, and panels

### Sidebar
- Fixed width layout
- Clearly active item styling
- Minimal visual weight, strong hover states

### Kanban board
- Columns should be compact but readable
- Card content should stay clean and scannable
- Drag target states should be obvious but not visually noisy

### Cards
- Clear title, tags, metadata, and action affordances
- Subtle hover elevation
- Good spacing between content blocks

---

## 8. Motion & Interaction Design
### Motion library
- Framer Motion will be used for transitions and micro-interactions

### Interaction principles
- Small, smooth transitions are preferred over large animations
- Dragging and reordering should feel snappy and responsive
- Hover states should add subtle elevation, not dramatic motion
- Modals and side panels should feel fluid and calm

### Suggested motion style
- Spring-based transitions for movement and layout updates
- Gentle scale and fade for overlays and cards
- Use motion to reinforce hierarchy, not to distract from the task

---

## 9. Drag-and-Drop Behavior
### Library
- dnd-kit for task and column interactions

### Desired behavior
- Smooth task movement between columns
- Clear drop target feedback
- Keyboard accessibility should be considered as the interaction is built
- The board should feel responsive and predictable during reorder actions

---

## 10. Iconography
- Use Lucide React for a clean, consistent icon system
- Keep icon sizes consistent based on usage:
  - small UI actions: 16px
  - navigation: 18px
  - empty states / feature accents: 24px to 32px

---

## 11. Responsive Guidance
The UI should be designed primarily for desktop use, with responsive adjustments for smaller screens later. The goal is to keep the board readable and usable on laptops and tablets without breaking the core visual hierarchy.

General principles:
- preserve clear spacing and readability
- collapse or simplify non-essential side content when needed
- maintain touch-friendly controls on smaller screens
- refine exact breakpoints during implementation rather than locking them too early

---

## 12. Accessibility Baseline
- Use strong focus states for interactive elements
- Keep text contrast comfortable in both dark and light themes
- Ensure interactive targets are large enough for usability
- Keep accessibility in mind while building motion and drag interactions

---

## 13. Summary
FocalDeck should feel premium, streamlined, and highly functional. The design language is dark-first, compact, modern, and built for productivity. The visual system is intentionally clean so that the core workflow — planning, moving, assigning, and tracking work — remains the focus.

The app should feel fast, serious, and easy to trust.

