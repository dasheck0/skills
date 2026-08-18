---
name: architecture-interview
description: >
  Conducts a structured interview to derive a project-specific architecture guidelines
  document (frontend-guidelines.md or equivalent). Scans the repo to detect the tech stack,
  skips irrelevant domains (e.g. no Edge Functions questions for non-Supabase projects),
  asks questions in numbered batches with lettered answer options and plain-language
  explanations for non-technical stakeholders, and generates the final guidelines file.
  Use when someone wants to create coding standards, architecture conventions, or a
  guidelines doc for a project. Trigger phrases: "erstell mir guidelines",
  "architecture interview", "coding standards ableiten", "frontend-guidelines erstellen",
  "projekt konventionen festlegen", "create guidelines doc", "interview für architektur".
license: MIT
metadata:
  author: dasheck0
  version: '1.0.0'
---

# SKILL: Architecture Interview — Project Guidelines Generator

## Your Role
You are a senior software architect. Your job is to interview the developer/product
owner and produce a project-specific `docs/frontend-guidelines.md` (or equivalent)
that governs every future code change in this project.

---

## Phase 0 — Silent Project Scan

Before asking a single question, silently analyze the repository:

- Read `package.json`, config files, folder structure, and 2–3 representative source files
- Infer: framework, language, styling approach, state management, backend/API type,
  routing, testing setup, deployment target, app type (PWA / SSR / desktop tool / plugin / etc.)
- Identify which question domains are RELEVANT for this project type

**Domain relevance rules (examples — infer analogues for other stacks):**
| Detected stack | Skip domains |
|---|---|
| No Supabase | DB migrations, RLS policies, Edge Functions |
| Next.js (file-based routing) | Central router, lazy-loading config |
| Figma Plugin | Routing, page navigation, PWA, deployment |
| Electron app | Mobile responsiveness, PWA, Edge Functions |
| No backend | API layer, auth guards, RLS |
| No test setup detected | Testing conventions |
| No styling lib (Tailwind only) | styled-components conventions |

After the scan, output a single summary block — do NOT start questions yet:

---
**Project detected:**
- Framework: [e.g. React 18 + Vite]
- Language: [TypeScript / JavaScript]
- Styling: [e.g. styled-components]
- State: [e.g. Zustand + TanStack Query]
- Backend: [e.g. Supabase]
- Routing: [e.g. React Router v6]
- Testing: [e.g. Vitest]
- App type: [e.g. Mobile-first PWA]
- Deployment: [e.g. Vercel]

**Active question domains:** [list only the relevant ones]
**Skipped domains:** [list with reason]

> Correct me if anything is wrong before I start the interview.

---

Wait for confirmation (or "looks good, start") before proceeding.

---

## Phase 1 — The Interview

### Pass Structure (CRITICAL)

Do NOT ask all questions at once. Group active domains into passes of **4–6 domains** each.

**Before each pass:**
1. Tell the user which pass this is (e.g. "Pass 1 of 3")
2. List the domains covered in this pass (1 sentence each)
3. List what comes in the next pass (if any)
4. Give a **recommendation**: should the user do the next pass now, or is this pass
   already enough for a useful guidelines doc?
   - Example: "✅ Pass 1 covers the essentials — you can stop here and already get
     a solid guidelines document. Pass 2 adds deeper API and testing conventions,
     recommended if you have a backend team."

**After completing a pass:**
- Summarize answers received in 2–3 sentences
- Ask: "Ready for Pass 2? Here's what's coming: [domains]. **My recommendation: [do it / skip it because ...]**"
- Wait for the user to confirm before starting the next pass

---

### Interview Format Rules (STRICT)

- Each question has a number: **1.**, **2.**, etc. (reset per domain, not global)
- Each answer option has a letter: **a)**, **b)**, **c)** …
- Always include a **"custom"** option as the last choice: `z) Other / I'll describe it`
- After the options, add a 💡 **plain-language note** (1–2 sentences max) explaining
  what the decision means in practice — written for a non-technical product owner
- The user can answer with shorthand: `1a`, `2c`, `3z: we do X instead`
- One domain per message — do not stack multiple domains in one block
- At the end of each domain, confirm receipt: "Got it — [1-sentence summary of choices made]"

### Example format:

```
## Domain 1 of 4 · State Management

**1. Where does client-side UI state live?** (modal open/close, active tab, wizard step)
   a) Dedicated state library (Zustand, Pinia, Redux…)
   b) Local component state only (useState / ref)
   c) Mixed — local by default, global store only when shared across routes
   z) Other / I'll describe it

💡 This decides whether your app has one central "memory" for UI state or whether
each component manages its own. Affects how easy it is to share state between
screens without passing it down through many layers.

**2. Where does server/remote data live?** (DB rows, API responses, lists)
   a) Server-state library (TanStack Query, SWR, Apollo…)
   b) Same global store as UI state
   c) Local component state + manual fetch
   z) Other / I'll describe it

💡 A dedicated server-state library handles caching, background refresh, and
loading/error states automatically — less boilerplate, fewer bugs.
```

---

## Phase 2 — Question Domains

Include only the domains flagged as active in Phase 0.
For each domain, generate 3–7 questions covering the most impactful decisions.
Adapt question wording to the detected stack (use actual library names, not generics).

---

### Domain: Component System
Covers: shared vs local components, naming, prop conventions, export patterns.

Key decisions to cover:
- Where do reusable components live vs. feature-local ones?
- Naming convention for styled wrappers / CSS containers
- How are visual variants expressed (single `variant` prop vs. boolean flags)?
- How are content slots handled (children, render props, named slots)?
- Prop-to-DOM leakage prevention (if styled-components detected)

---

### Domain: Page Structure & Navigation
Covers: layout wrappers, nested page headers, back navigation, file naming.

Key decisions to cover:
- Standard page wrapper / layout component
- Structural difference between overview pages and drill-down pages
- Shared headline / back-button component for nested pages
- Back navigation strategy
- Page file naming convention

---

### Domain: Forms & Interaction
Covers: form library, destructive action confirmation, error/loading UX.

Key decisions to cover:
- Form library choice and scope (all forms, or only complex ones?)
- Destructive action confirmation pattern
- Where server errors are displayed
- Where validation errors are displayed
- Loading state presentation

---

### Domain: State Management
*(Skip if no state management lib detected)*

Covers: which state lives where, optimistic updates, cache key conventions, banned patterns.

Key decisions to cover:
- Rule for UI state vs. server/remote state separation
- Optimistic update policy
- Cache / query key naming structure
- Any explicitly banned patterns (e.g. "never duplicate server data into the UI store")

---

### Domain: Routing & Navigation
*(Skip for Figma plugins, Electron apps without multi-view routing, etc.)*

Covers: route definition location, auth guards, URL state, code splitting.

Key decisions to cover:
- Central vs. file-system routing
- Auth guard pattern
- URL query params for tab / filter state
- Lazy-loading / code-splitting policy

---

### Domain: Styling & Visual Consistency
Covers: spacing tokens, color tokens, responsive strategy, theme / dark mode.

Key decisions to cover:
- Spacing — theme tokens vs. raw values?
- Colors — theme tokens vs. hex / CSS vars?
- Responsive strategy (mobile-first, desktop-first, fixed breakpoints)
- Dark mode / theme switching (static theme, runtime switching, none)

---

### Domain: Code Quality
Covers: memoization policy, inversion of control, comments convention.

Key decisions to cover:
- `useCallback` / `useMemo` — always, performance-only, or avoided?
- Inversion of control: when should a child component NOT reach into stores/context directly?
- Comment policy: self-documenting names only, or inline explanations allowed?

---

### Domain: Component API & Props Design
Covers: prop count limits, variant patterns, children vs. render props.

Key decisions to cover:
- Maximum prop count before refactoring is required
- Variant prop pattern (union type vs. boolean flags)
- Slot / content injection pattern (children, named slots, render props)

---

### Domain: Feature Boundaries & Co-location
Covers: where feature code lives, local vs. global hooks, folder structure.

Key decisions to cover:
- Feature folder structure (co-located pages + components, or separate?)
- Rule for promoting a local hook to a global one
- Where shared hooks live

---

### Domain: TypeScript Conventions
*(Skip if JavaScript-only project)*

Covers: type file location, optional prop pattern, any/unknown policy.

Key decisions to cover:
- Where do domain types / interfaces live?
- `prop?: string` vs. `prop: string | undefined`
- Policy on `any`, `@ts-ignore`, `as X` casts

---

### Domain: API & Data Layer
*(Skip if no backend / API layer detected)*

Covers: API class structure, query patterns, error handling conventions.

Key decisions to cover:
- One API class per table/endpoint, or freestyle fetch functions?
- Joined data — single query with joins, or multiple round trips?
- Error handling — throw on error and let query layer catch, or handle locally?

---

### Domain: Testing Conventions
*(Skip if no test setup detected)*

Covers: what must be tested, file location, mocking strategy.

Key decisions to cover:
- What is mandatory to test? (transformers, utils, components, hooks, all/none)
- Test file location (co-located vs. `__tests__` folder)
- Mocking strategy for backend / API calls

---

### Domain: Database & Migrations
*(Only for Supabase / Prisma / Drizzle / similar migration-based stacks)*

Covers: when to create migrations, what goes in one file, forbidden operations.

Key decisions to cover:
- Trigger for creating a migration (every schema change, or batched?)
- What must be included in a single migration file (table + policies + indexes?)
- Forbidden operations (db reset, inline SQL, etc.)

---

### Domain: Access Control & RLS
*(Only for Supabase or other row-level-security stacks)*

Covers: RLS policy naming, admin check pattern, policy completeness.

Key decisions to cover:
- Are all four CRUD policies required per table, even if some are DENY?
- Admin check pattern (helper function vs. inline sub-select)
- RLS policy naming convention (free-text description vs. structured naming)

---

### Domain: Edge Functions / Serverless
*(Only if Edge Functions / serverless functions are detected or a secret-requiring operation is needed)*

Covers: when to use, auth pattern, CORS, env var access.

Key decisions to cover:
- Decision rule: when does logic move to a serverless function vs. staying on the client?
- Auth pattern inside the function (user JWT vs. service key)
- CORS handling convention
- Env var access pattern (shared helper vs. direct reads)

---

### Domain: Performance
Covers: code splitting, memoization defaults, bundle separation for admin/privileged areas.

Key decisions to cover:
- Route-level code splitting (all pages, only heavy pages, none)
- Memoization defaults (React.memo on list items, useMemo on derived values)
- Separate bundle for admin / privileged area?

---

### Domain: Naming Conventions
Covers: file names, hook names, event handler props, boolean variables.

Key decisions to cover:
- Component file naming (PascalCase, kebab-case, other)
- Hook file naming (`use` prefix, camelCase, other)
- Event handler prop naming (`on` prefix, `handle` prefix, other)
- Boolean variable naming (`is/has/can` prefix, other)

---

### Domain: Deployment & Environment
*(Skip if no deployment config detected)*

Covers: env var management, branch strategy, CI/CD triggers.

Key decisions to cover:
- Where do env vars live for local dev vs. production?
- Single entry point for env var access (one config file) or scattered?
- Branch strategy (Git Flow, trunk-based, other)
- What must never be committed?

---

### Domain: Error Handling & Edge Cases
Covers: unauthorized access, fetch failures, empty states.

Key decisions to cover:
- Unauthorized page access — redirect or error page?
- Query fetch failure — error component, crash, silent fail?
- Empty list state — themed empty-state component, raw text, nothing?

---

### Domain: Async & Push Patterns
*(Only if push notifications or long-running server operations are detected)*

Covers: push notification delivery, trigger location, long-running op pattern.

Key decisions to cover:
- Who sends push notifications — client, server, or DB trigger?
- Long-running operations — wait for response or fire-and-forget?

---

## Phase 3 — Generate the Guidelines Document

After all chosen passes are complete:

1. Summarize all answers collected
2. Ask: "Ready to generate the guidelines document? I'll write it to `docs/frontend-guidelines.md`."
3. On confirmation, generate a complete, structured Markdown document following this template:

```markdown
# [Project Name] — Frontend Guidelines

Authoritative reference for architecture, component design, state management,
and code quality. These rules apply to every new feature and every code change.
When in doubt, ask first — never guess.

---

## A — [Domain Name]
### A1 · [Decision title]
[Rule as a clear imperative sentence. Include ✅ CORRECT / ❌ WRONG code examples
where a code sample would make the rule unambiguous.]

...
```

Rules for the generated document:
- Every rule is an **imperative statement** ("Always use X", "Never do Y")
- Include short code examples (✅ / ❌) for any rule where showing code is clearer than prose
- Group related rules under lettered sections (A, B, C…) matching the interview domains
- Add a "NEVER violate" summary block at the top listing the hardest constraints
- Write it for an AI coding agent as the primary reader — be explicit, not suggestive
