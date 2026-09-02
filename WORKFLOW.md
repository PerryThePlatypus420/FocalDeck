# FocalDeck — User Workflow & Architecture

**Version:** 1.0  
**Last Updated:** 2026-09-02  
**Status:** LOCKED (Core workflow defined, will evolve with features)

---

## Table of Contents

1. [User Journey](#user-journey)
2. [Permission Matrix](#permission-matrix)
3. [Hierarchy & Concepts](#hierarchy--concepts)
4. [Feature Breakdown](#feature-breakdown)
5. [Real-Time Sync](#real-time-sync)
6. [Technical Decisions](#technical-decisions)

---

## User Journey

### Step 1: Authentication (COMPLETE)

- User signs up with email/password or Google OAuth
- Account created in auth.users (Supabase)
- User metadata stores full_name
- User redirected to /dashboard

### **Step 2: Dashboard — Workspaces (TODO)**

**Route:** `/dashboard`

User sees:

- **If no workspaces:** Empty state + "Create Workspace" button
- **If has workspaces:** List of workspaces (owned + invited to)
- **Analytics:** Overall stats (total tasks, due today, assigned to me)

**Action:** User clicks "Create Workspace"

### **Step 3: Create Workspace (TODO)**

**Modal/Form:** Workspace Creation

User inputs:

- Workspace name (required)
- Workspace description (optional)

On creation:

- New workspace record created with user as `owner`
- User redirected to workspace view

### **Step 4: Workspace View (TODO)**

**Route:** `/workspace/[workspaceId]`

User sees:

- Workspace name & description
- List of projects (public + private projects they have access to)
- Empty state if no projects: "Create Project" button
- Workspace members sidebar (who's invited)
- Analytics for this workspace

**Actions available (if owner):**

- Create project
- Invite members
- Configure workspace

### **Step 5: Invite Workspace Members (TODO)**

**Modal/Form:** Invite Members

Options:

- **Email-based:** Enter email address → system sends invite link → invitee joins
- **Copy link:** Generate invite link with role pre-selected → share manually

Role selected by inviter: `owner` / `admin` / `member`

Invitee receives email (if email invite) or can use link, joins workspace with selected role.

### **Step 6: Create Project (TODO)**

**Route:** `/workspace/[workspaceId]/create-project` or modal

User (workspace owner/admin) inputs:

- Project name (required)
- Project description (optional)
- **Visibility:**
  - `public` — All workspace members can view & access
  - `private` — Only project members can view & access
- **Kanban Configuration:**
  - Default columns shown: "To Do", "In Progress", "Review", "Done"
  - User can edit: add, remove, rename columns
  - Column order matters (left-to-right flow)

On creation:

- Project created with user as `lead`
- If private, only creator is initially a member
- Redirected to project board

### **Step 7: Project View — Kanban Board (TODO)**

**Route:** `/workspace/[workspaceId]/project/[projectId]`

User sees:

- **Kanban board** with columns (configurable)
- **Tasks** as cards in columns
- **Task card** shows: title, assignee, priority, due date, description (on hover/click)
- **Project members** sidebar
- **Project settings** (if lead)

**Actions available:**

- Create task (any member)
- Edit task (any member)
- Assign task (any member) → assigned user gets notification
- Move task between columns (drag-and-drop with dnd-kit)
- Delete task (any member)
- Invite project members (if lead)

### **Step 8: Create Task (TODO)**

**Modal/Form:** Task Creation

User inputs:

- Title (required)
- Description (optional)
- Assignee (optional, can be empty)
- Priority: `critical` / `high` / `medium` / `low`
- Due date (optional)
- Column/status (defaults to first column, "To Do")

On creation:

- Task added to project
- Assignee notified (real-time if subscribed)

### **Step 9: Task Management (TODO)**

Users can:

- **Edit task:** Click task card → modal opens → edit fields
- **Assign task:** Click assignee field → select from project members
- **Change priority:** Click priority badge → select new priority
- **Move between columns:** Drag task to different column (updates status)
- **View details:** Click task → expanded view with comments/history (future)

---

## Permission Matrix

### Workspace Roles & Governance

#### Role Hierarchy

```
Owner (sole authority, cannot be removed without succession)
  └─ Manager (delegated authority, for temporary oversight)
       └─ Admin (administrative privileges)
            └─ Member (base access)
```

#### Workspace Role Permissions

| Permission                                 | Owner | Manager | Admin | Member |
| ------------------------------------------ | ----- | ------- | ----- | ------ |
| View workspace                             | Yes   | Yes     | Yes   | Yes    |
| Invite members to workspace                | Yes   | Yes     | Yes   | No     |
| Remove members from workspace              | Yes   | Yes     | Yes   | No     |
| Assign/Change member roles (non-Owner)     | Yes   | Yes     | Yes   | No     |
| Create projects                            | Yes   | Yes     | Yes   | No     |
| Delete projects                            | Yes   | Yes     | Yes   | No     |
| Invite new workspace Owners                | Yes   | No      | No    | No     |
| Transfer Owner role to another user        | Yes   | No      | No    | No     |
| Delete workspace                           | Yes   | No      | No    | No     |
| Edit workspace settings                    | Yes   | Yes     | Yes   | No     |
| Change project visibility (public/private) | Yes   | Yes     | Yes   | No     |

#### Manager Role (Special Governance Role)

**Purpose:** Delegated authority when Owner is unavailable or for specific governance needs

**Characteristics:**

- Can act as Admin (manage members, create projects, modify settings)
- Cannot assign new Owners or transfer Owner role
- Cannot delete workspace
- Cannot make major irreversible changes
- Cannot change Owner role of anyone
- Designed for temporary delegation (e.g., COO handling day-to-day while CEO unavailable)

**When to Use:**

- Owner delegation during absence
- HR/Operations lead with broad access but not full ownership
- Team lead managing workspace on behalf of owner

#### Owner Succession Requirements

**Critical Constraint:** Owner cannot voluntarily leave workspace

**Rules:**

- If Owner wants to leave, they MUST:
  1. Assign at least one other user as Owner
  2. Owner role cannot be downgraded without explicit succession
  3. If Owner is removed (e.g., deleted account), workspace goes to "orphaned" state
  4. Workspace cannot function without at least one Owner
- Only Owners can assign new Owners

#### Future Consideration: HR/Special Roles

Discussed for Phase 2+ implementation:

- HR role for handling user management across workspaces
- Finance role for billing/invoicing (if multi-workspace)
- Audit/Compliance role for viewing activity logs
- These can be added once workspace maturity increases

### Project Roles

| Permission                | Lead | Contributor |
| ------------------------- | ---- | ----------- |
| View project (if public)  | Yes  | Yes         |
| View project (if private) | Yes  | Yes         |
| Create tasks              | Yes  | Yes         |
| Edit tasks                | Yes  | Yes         |
| Delete tasks              | Yes  | Yes         |
| Move tasks (drag-drop)    | Yes  | Yes         |
| Assign tasks to others    | Yes  | Yes         |
| Invite members            | Yes  | No          |
| Remove members            | Yes  | No          |
| Configure columns         | Yes  | No          |
| Change project visibility | Yes  | No          |
| Delete project            | Yes  | No          |

### Task-Level Permissions

- Any project member can assign tasks to any other project member
- Task creator can always edit/delete their own task
- Any member can edit any task (collaborative environment)

---

## Hierarchy & Concepts

```
User (authenticated)
  ├─ Workspace (Owner/Manager/Admin/Member)
  │   ├─ Owner - Full control, manages other owners, cannot leave without succession
  │   ├─ Manager - Delegated authority, broad admin-like access, no owner assignment
  │   ├─ Admin - Administrative access, manages members and projects
  │   ├─ Member - Base access, limited to assigned work
  │   │
  │   ├─ Project (Lead/Contributor)
  │   │   ├─ Task (assigned to user)
  │   │   │   ├─ Status (column)
  │   │   │   ├─ Priority (critical/high/medium/low)
  │   │   │   ├─ Due Date
  │   │   │   ├─ Assignee(s) - future: multiple
  │   │   │   └─ Description
  │   │   └─ Column (To Do, In Progress, Review, Done, or custom)
  │   │
  │   └─ Workspace Member (user + role + permissions)
  │
  └─ (Can have multiple workspaces)
```

### Key Entities

**Workspace**

- Container for projects and team
- Must have at least one Owner at all times
- Has Owner(s), Manager(s), Admin(s), and Members
- Can have public/private projects
- Analytics aggregated from all projects
- Owner succession is required when owner attempts to leave

**Workspace Roles Detailed:**

- Owner: Full governance control, must assign successor before leaving
- Manager: Delegated authority, broad access but cannot assign owners or delete workspace
- Admin: Can manage members, create/delete projects, edit settings
- Member: Base access, limited to personal work assignments

**Project**

- Belongs to a workspace
- Has Leads and Contributors
- Can be public (all workspace members see) or private (members only)
- Has customizable Kanban columns
- Tracks tasks
- Only Leads can add/remove project members and change visibility

**Task**

- Belongs to a project
- Has status (column), priority, due date, assignee
- Can be created/edited by any project member
- Can be assigned to any project member by any project member
- Moves between columns via drag-and-drop

**Workspace Member**

- User + role (Owner/Manager/Admin/Member) in a workspace
- Can be invited via email or link
- Role determines workspace-level permissions
- Can belong to multiple workspaces with different roles

---

## Feature Breakdown

### MVP (Phase 1) - Foundation

- Authentication (email/password + Google OAuth)
- Display user on dashboard
- Workspace CRUD (create, read, list, update)
- Workspace Owner role with succession requirement
- Invite workspace members (email + link, with role selection restricted to non-Owner)
- Project CRUD with public/private visibility
- Kanban board with drag-and-drop (dnd-kit)
- Task CRUD (create, read, update, delete)
- Task assignment
- Real-time updates (Supabase subscriptions)
- Basic workspace analytics

### Phase 2 - Polish & Governance

- Manager role implementation (delegated authority)
- Admin role refinement
- Workspace switcher (dropdown/menu)
- Task filters (by assignee, priority, due date)
- Search tasks
- Bulk task actions
- Column customization (add/remove/rename)
- Task comments (basic)
- Activity log (who did what)
- Basic audit trail for sensitive operations

### Phase 3 - Advanced & Special Roles

- Multiple assignees per task
- Task dependencies
- Recurring tasks
- Calendar view
- Timeline/Gantt view
- Analytics dashboard
- Email notifications (comprehensive)
- Workspace templates
- Audit logs (detailed)
- HR/Special roles implementation (if needed)
- Billing/Finance role (multi-workspace)
- Compliance/Audit role

---

## Real-Time Sync

### Supabase Subscriptions

Which events trigger real-time updates?

| Event                       | Subscribers Notified          | Via                      |
| --------------------------- | ----------------------------- | ------------------------ |
| Task created                | Project members viewing board | Realtime DB subscription |
| Task updated                | Project members               | Realtime DB subscription |
| Task moved (column changed) | Project members               | Realtime DB subscription |
| Task assigned to me         | Just me                       | Toast + realtime         |
| Project member invited      | New member                    | Email (async)            |
| Workspace member invited    | New member                    | Email (async)            |
| Member role changed         | Affected member               | Toast notification       |

### Implementation Strategy

- Use Supabase REALTIME channel subscriptions
- Subscribe to project's tasks table on board view
- Subscribe to specific task when editing
- Unsubscribe when leaving page (cleanup)
- Handle disconnections with automatic reconnection

---

## Technical Decisions

### Database Design Approach

- Supabase PostgreSQL with Row Level Security (RLS)
- All permissions enforced at database level
- Policies: Users can only see/modify data they have access to
- Workspace Owner succession enforced at application level with database constraints

### Authentication

- Supabase Auth with email and password
- Google OAuth (credentials needed)
- Session stored in cookies (via @supabase/ssr)
- proxy.ts refreshes tokens automatically

### Drag & Drop

- dnd-kit library (already in dependencies)
- Updates task status when dropped in new column
- Optimistic UI updates for snappy feel

### Real-Time

- Supabase Realtime subscriptions (Postgres changes)
- Subscribed channels: project tasks, workspace members, project members
- Automatic reconnection handling

### Governance & Permissions

- Owner role cannot be assigned by inviter
- Only current Owners can assign new Owners
- Owner cannot leave without assigning successor
- Manager role for delegated authority (no owner assignment power)
- Audit trail for sensitive operations (owner assignments, deletions)

### UI/UX Principles

- Desktop-first, responsive refinement later
- Subtle motion (Motion library)
- Clean, dense layout
- Premium aesthetic (dark-first)
- Fast and efficient (no unnecessary re-renders)

---

## Development Checklist

### **Before Starting Each Feature**

- [ ] Define exact routes and pages needed
- [ ] List all API/server actions required
- [ ] Sketch UI mockup (refer to DESIGN.md)
- [ ] Write database migrations
- [ ] Implement Row Level Security (RLS) policies
- [ ] Create server actions
- [ ] Build UI components
- [ ] Test permissions
- [ ] Test real-time updates

### **Testing Scenarios**

- [ ] User can create workspace
- [ ] Invited user receives email and can join
- [ ] Public project visible to all workspace members
- [ ] Private project visible only to members
- [ ] Only leads can invite/manage project members
- [ ] Task changes appear in real-time for all viewing
- [ ] Task assigned → assignee notified
- [ ] Drag-drop updates task status in real-time
- [ ] Permissions enforced at database level (RLS)

---

## Notes & Future Modifications

- This workflow is locked for MVP but will evolve
- Column customization timing: Can add in Phase 2 if too complex for Phase 1
- Multiple assignees: Future enhancement (start with single assignee)
- Task dependencies: More complex, Phase 3+
- Email notifications: Basic version MVP, enhanced later

---

**Questions Before Database Design?**

- Are we clear on the workflow?
- Any changes needed before we design the schema?
- Ready to start database design? 🎯
