---
name: ordina-panel-detail-page
description: This skill should be used when creating a detail page (/dashboard/[entity]/[id]) in the ordina-panel Next.js admin panel. It covers the full pattern for the detail page structure, async header card with entity information, tab system with related ListSections, server-side Apollo service, and singular GraphQL query. Triggers when the user says things like "crea la pantalla de detalle de X", "agrega tabs al detalle de X", "quiero ver el detalle de X con sus relaciones", or when implementing a [id]/page.tsx view in ordina-panel.
---

# ordina-panel-detail-page

Skill for creating detail pages in the `ordina-panel` Next.js 14 admin panel. A detail page shows all information about a single entity and its related sub-entities organized in tabs.

## Reference Documentation

For the complete pattern reference with code examples from Business, Branch, Employee, and ShiftPlan:

```
.claude/skills/ordina-panel-detail-page/references/detail-page-patterns.md
```

Load this file before starting any implementation.

## Scaffold Script

To generate all boilerplate files for a new detail page:

```bash
# Detalle estándar con tabs
python3 .claude/skills/ordina-panel-detail-page/scripts/scaffold_detail.py Branch

# Sin tabs (variante solo-header con Cards)
python3 .claude/skills/ordina-panel-detail-page/scripts/scaffold_detail.py ShiftPlan --no-tabs

# Identificador único diferente a "id"
python3 .claude/skills/ordina-panel-detail-page/scripts/scaffold_detail.py Employee --id-field CURP
```

El script genera:
- `src/graphql/[ec]/[ec].detail.query.ts` — query singular GET_[ENTITY]
- `src/services/server/[Entity]/get[Entity]Detail.ts` — service server-side con Apollo
- `src/app/dashboard/[ek]/[id]/page.tsx` — page con `force-dynamic` + Suspense
- `src/app/dashboard/[ek]/components/detail/Header[Entity]DetailPage.tsx` — async Server Component
- `src/app/dashboard/[ek]/components/detail/[Entity]TabSection.tsx` — tabs (si no --no-tabs)

## Implementation Workflow

### Step 1 — Run the scaffold script

```bash
python3 .claude/skills/ordina-panel-detail-page/scripts/scaffold_detail.py <EntityName>
```

Opciones:
- `--no-tabs` si el detalle no tiene entidades relacionadas en tabs (como ShiftPlan)
- `--id-field CURP` si el modelo Keystone usa un campo único distinto a `id` (como Employee con CURP)

### Step 2 — Complete the GraphQL query

In `src/graphql/[ec]/[ec].detail.query.ts` add all fields needed by the Header Card:
- Fields to display in the info grid
- Nested parent relations: `parent { id name photo { url } }`
- Count fields for stats: `childrenCount`

Then merge this into the main `[ec].query.ts` file (or keep it separate — both work).

### Step 3 — Adjust the server-side service

In `src/services/server/[Entity]/get[Entity]Detail.ts`:
- Verify the `where` clause matches the model's unique field
- By `id`: `{ where: { id } }` (default)
- By unique field: `{ where: { curp } }`, `{ where: { rfc } }`, etc.

### Step 4 — Complete the Header Card

In `Header[Entity]DetailPage.tsx`:
- Add `AvatarImage src` if the entity has a photo field
- Add stat counters (right section) for `*Count` fields
- Add info grid items for each relevant field (address, phone, email, dates)
- Add `<Badge>` + `<Link>` for parent entity if applicable
- Apply conditional rendering: `{field && <InfoItem />}`

Each info item follows this exact pattern:
```tsx
{field && (
  <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
    <Icon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
    <div className="min-w-0 flex-1">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Label</div>
      <div className="text-sm font-medium text-gray-900 break-words">{field}</div>
    </div>
  </div>
)}
```

For clickable fields (phone, email):
```tsx
<a href={`tel:${phone}`} className="text-sm font-medium text-gray-900 break-all hover:text-blue-600">
  {phone}
</a>
```

### Step 5 — Add tabs (if applicable)

In `[Entity]TabSection.tsx`, add an `ITabsProps` entry for each related entity:
```tsx
{
  name: "Empleados",       // Display text
  value: "employees",      // URL ?tab=employees (no spaces, no accents)
  visible: true,
  count: 0,
  component: <EmployeeListSection EntityId={EntityId} />,
}
```

The corresponding `ListSection` must already accept the parent `EntityId` as a prop to filter results.

### Step 6 — Enable DetailButton in ActionButton

In `src/table/[Entity]Table/[Entity]ActionButton.tsx`, uncomment:
```tsx
import { DetailButton } from "@/components/actionButton/detailButton";
// ...
<DetailButton href={`/dashboard/[ek]/${id}`} showIcon={true} />
```

## Key Rules

- **`export const dynamic = "force-dynamic"`** is mandatory in `[id]/page.tsx` — without it Next.js caches the page and data becomes stale.
- **Header is always an async Server Component** — no `"use client"`, fetches directly via Apollo (not `/api/v1/`).
- **TabSection is also a Server Component** — no `"use client"`. Only `TabsSection` (shared component) is a Client Component.
- **Error state with `AlertCircle` comes first** — before the main return, always.
- **All fields are conditionally rendered** — `{field && <.../>}` never crash on null.
- **Tab `value` goes into URL** — use simple lowercase strings without spaces or accents: `"shift"`, `"employees"`, `"attendance-rules"`.
- **`TabsSection` replaces ALL query params** when switching tabs — if `?q=search` exists, it gets wiped.
- **Service always returns `null` on error** — Header handles the error state, service never throws to the caller.

## Layout Variants

### Variant A — Header + Tabs (Business, Branch, Employee)
Use when the entity has related sub-entities to show in tabs. Default scaffold output.

### Variant B — Multi-Card layout without Tabs (ShiftPlan)
Use `--no-tabs` when the entity's detail is self-contained (no separate list views needed). Replace the single Card with a grid of themed Cards, one per information category.
