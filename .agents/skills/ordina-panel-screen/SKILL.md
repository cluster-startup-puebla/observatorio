---
name: ordina-panel-screen
description: This skill should be used when creating a new CRUD screen (pantalla) in the ordina-panel Next.js admin panel. It provides the architecture patterns, component structure, file naming conventions, and a scaffold script to generate all required boilerplate for a new entity screen. Triggers when the user says things like "crea una nueva pantalla para X", "agrega el módulo de X al panel", "necesito el CRUD de X", or when implementing a new entity view in ordina-panel.
---

# ordina-panel-screen

Skill for creating new entity screens in the `ordina-panel` Next.js 14 admin panel. Every screen follows a strict layered architecture connecting Next.js App Router pages to a Keystone.js GraphQL backend via internal Next.js API Routes.

## Reference Documentation

For the complete architecture patterns, component rules, and examples from Roles, Business, and Branch screens, read:

```
.claude/skills/ordina-panel-screen/references/screen-patterns.md
```

Load this file into context before starting any implementation work.

## Scaffold Script

To generate all boilerplate files for a new entity at once, run:

```bash
python3 .claude/skills/ordina-panel-screen/scripts/scaffold_screen.py <EntityName> [--no-detail]
```

Examples:
```bash
# Entity with detail page (default)
python3 .claude/skills/ordina-panel-screen/scripts/scaffold_screen.py Product

# Entity without detail page
python3 .claude/skills/ordina-panel-screen/scripts/scaffold_screen.py Commission --no-detail
```

The script generates:
- GraphQL queries and mutations (`src/graphql/`)
- API Route handlers with controller + service pattern (`src/app/api/v1/`)
- Client services via axios (`src/services/client/`)
- TanStack Table components (`src/table/`)
- ListSection (`src/section/`)
- Dashboard page, Header, FormWrapper, and hooks (`src/app/dashboard/`)
- Optional detail page (`src/app/dashboard/[entity]/[id]/`)

All files are generated with `TODO` comments marking what needs to be adjusted (fields, Keystone key, icons, etc.).

## Implementation Workflow

Follow these steps in order when creating a new screen:

### Step 1 — Run the scaffold script

```bash
python3 .claude/skills/ordina-panel-screen/scripts/scaffold_screen.py <EntityName>
```

Review the output list of created files and the TODOs printed at the end.

### Step 2 — Verify the Keystone model key

Open `src/app/dashboard/<entity>/page.tsx` and confirm the key passed to `getFormData({ key: "..." })` matches the exact model name in `internal-ordina-core/schema.ts`. The key is case-sensitive.

### Step 3 — Adjust GraphQL fields

In `src/graphql/<entity>/<entity>.query.ts`:
- Add all fields needed by the table (what the list view displays)
- Match field names exactly to the Keystone model

In `src/graphql/<entity>/<entity>.mutation.ts`:
- Add all input fields needed for CREATE
- UPDATE is used for soft delete (sets `deleted: true`) — verify the model has a `deleted` boolean field

### Step 4 — Adjust API service fields

In `src/app/api/v1/<entity>/create/<entity>create.services.ts`:
- Map the correct fields from the form data to the GraphQL mutation variables

In `src/app/api/v1/<entity>/create/route.ts`:
- Update `requiredKeys` to match the actual required fields for creation

### Step 5 — Adjust FormWrapper overrides

In `src/app/dashboard/<entity>/components/<Entity>FormWrapper.tsx`:
- Ensure `overrides.hide` includes `["id", "createdAt", "updatedAt", "deleted"]` plus any hasMany relation fields
- Add `customFields` for any FK relation fields that need a search component (see `src/components/search/` for available components)

### Step 6 — Adjust table columns

In `src/table/<Entity>Table/get<Entity>Columns.tsx`:
- Add columns for the fields relevant to display in the list
- Always keep the `"Acciones"` column last
- For detail navigation: uncomment `DetailButton` in `<Entity>ActionButton.tsx`

### Step 7 — Add route to sidebar

Add the new route to the sidebar navigation. Check the existing sidebar component (typically in `src/components/layout/` or `src/app/dashboard/layout.tsx`) and add the entry following the existing pattern.

### Step 8 — Implement detail page (if applicable)

If the entity has a detail page, implement:
1. `src/services/server/<Entity>/get<Entity>Detail.ts` — server-side Apollo query
2. `src/app/dashboard/<entity>/components/detail/Header<Entity>DetailPage.tsx` — async Server Component with entity info card
3. `src/app/dashboard/<entity>/components/detail/<Entity>TabSection.tsx` — tabs with related ListSections

## Key Architecture Rules

- **Never call Keystone GraphQL directly from the browser.** All mutations/queries from client components go through `/api/v1/...` routes.
- **Server Components (page.tsx) may call Keystone directly** via `createApolloClient()` for read-only server-side fetches (detail pages, form metadata).
- **Soft delete only** — no hard deletes. Always use `UPDATE_*` mutation with `{ deleted: true }`. All list queries filter `{ deleted: { equals: false } }`.
- **refreshStore is the re-fetch signal** — call `needRefresh()` after any CRUD operation; ListSections listen to the `refresh` value in their `useEffect` dependency.
- **10 records per page** — pagination is hardcoded to `take: 10` with `skip: (page - 1) * 10`.
- **formStore is optional** — only use it when an entity needs inline edit support (like Business). Simple entities use `useSlideOver()` only.
- **DynamicForm is driven by Keystone adminMeta** — field types, labels, and validation come from `getFormData({ key })`. Always hide system fields via `overrides.hide`.
