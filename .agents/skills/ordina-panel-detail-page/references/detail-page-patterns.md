# Documentación: Pantallas de Detalle en ordina-panel

Esta guía cubre el patrón completo para crear páginas de detalle (`/dashboard/[entidad]/[id]`) con su header de información y sistema de tabs. Se analizaron **Business**, **Branch** y **Employee** como fuente principal, y se validó contra **ShiftPlan**.

---

## Índice

1. [Visión General](#1-visión-general)
2. [Estructura de Archivos](#2-estructura-de-archivos)
3. [Capa 1 — Detail Page (`[id]/page.tsx`)](#3-capa-1--detail-page-idpagetsx)
4. [Capa 2 — Header Detail Page (Server Component async)](#4-capa-2--header-detail-page-server-component-async)
5. [Capa 3 — TabSection (Server Component)](#5-capa-3--tabsection-server-component)
6. [Capa 4 — TabsSection (Client Component compartido)](#6-capa-4--tabssection-client-component-compartido)
7. [Capa 5 — Servicio de Detalle (Server-side)](#7-capa-5--servicio-de-detalle-server-side)
8. [Capa 6 — GraphQL Query de Detalle](#8-capa-6--graphql-query-de-detalle)
9. [Anatomía del Header Card](#9-anatomía-del-header-card)
10. [Variantes de Layout](#10-variantes-de-layout)
11. [Checklist para crear una Pantalla de Detalle](#11-checklist-para-crear-una-pantalla-de-detalle)
12. [Validación — ShiftPlan](#12-validación--shiftplan)

---

## 1. Visión General

```
/dashboard/branches/[id]
        │
        ├── HeaderDashboard (breadcrumb, sin botón de crear)
        │
        └── <Suspense>
              ├── HeaderBranchDetailPage   ← async Server Component, fetch + Card
              └── BranchTabSection         ← Server Component, define tabs
                        └── TabsSection    ← Client Component, maneja estado de tab activo
                              └── [tab activo].component  ← ListSection filtrado por id
```

**Reglas clave:**
- La URL del detalle es siempre `/dashboard/[entidad]/[id]`  (excepción: Employee usa `[CURP]`)
- El tab activo se persiste en la URL: `?tab=shift`
- Los tabs reutilizan los mismos `ListSection` de las listas principales, pasando el id como filtro
- **Nunca** se hace fetch directo a Keystone desde el browser en estas páginas — el Header Detail es Server Component

---

## 2. Estructura de Archivos

```
src/app/dashboard/[entidad]/
├── [id]/
│   └── page.tsx                              ← Server Component, force-dynamic
├── components/
│   └── detail/
│       ├── Header[Entidad]DetailPage.tsx     ← async Server Component
│       └── [Entidad]TabSection.tsx           ← Server Component (sin "use client")
└── ...

src/services/server/[Entidad]/
└── get[Entidad]Detail.ts                     ← Apollo directo, server-side

src/graphql/[entidad]/
└── [entidad].query.ts                        ← Agrega GET_[ENTIDAD] con más campos
```

---

## 3. Capa 1 — Detail Page (`[id]/page.tsx`)

```tsx
// src/app/dashboard/branches/[id]/page.tsx
import HeaderDashboard from "@/components/dashboard/HeaderDashboard";
import { ListLoader } from "@/section/ListLoader";
import React, { Suspense } from "react";
import HeaderBranchDetailPage from "../components/detail/headerDetailPage";
import BranchTabSection from "../components/detail/BranchTabSection";

export const dynamic = "force-dynamic"; // ← SIEMPRE, sin esto Next.js cachea y los datos no se actualizan

export default function BranchDetailPage({
  params,
}: {
  params: { id: string }; // ← nombre del param igual al nombre de la carpeta [id]
}) {
  const { id } = params;

  return (
    <section>
      <HeaderDashboard
        text="Detalles de la sucursal"
        links={linksBranchDetail(id)}
        activedbutton={false}   // ← Sin botón de crear en detalle
        textbutton=""
        iconbutton=""
        detailInfo={`${id}`}    // ← Muestra el id en el breadcrumb
      />
      <Suspense fallback={<ListLoader size="large" />}>
        <section className="rounded-2xl my-10">
          <HeaderBranchDetailPage BranchId={id} />
          <BranchTabSection BranchId={id} />
        </section>
      </Suspense>
    </section>
  );
}

// breadcrumb: Lista → Detalle
const linksBranchDetail = (id: string) => [
  { name: "Sucursales", href: "/dashboard/branches" },
  { name: "Detalle", href: `/dashboard/branches/${id}` },
];
```

**Reglas:**
- `export const dynamic = "force-dynamic"` es obligatorio — sin esto la página se cachea y los datos quedan desactualizados
- `activedbutton={false}` siempre — no hay botón de "Nuevo" en páginas de detalle
- `detailInfo={id}` muestra el identificador en el breadcrumb
- El `id` puede tener otro nombre si el modelo usa un campo único diferente (ej: Employee usa `[CURP]` → `params.CURP`)
- No es un Server Component async — no hace fetch directamente. El fetch lo hace `HeaderBranchDetailPage`

---

## 4. Capa 2 — Header Detail Page (Server Component async)

**Archivo:** `src/app/dashboard/[entidad]/components/detail/Header[Entidad]DetailPage.tsx`

Este componente es **async** y hace el fetch directamente a Keystone via Apollo.

### Estructura obligatoria

```tsx
// Sin "use client" — es Server Component
import { getBranchDetail } from "@/services/server/Branch/getBranchDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, MapPin, Phone, Mail, Calendar } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

export default async function HeaderBranchDetailPage({
  BranchId,
}: {
  BranchId: string;
}) {
  const branch = await getBranchDetail(BranchId); // ← fetch directo a Keystone

  // 1. Estado de error — siempre primero
  if (!branch) {
    return (
      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="mx-auto h-12 w-12 mb-2" />
            <p>No se pudo cargar la información de la sucursal</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-border shadow-sm mb-6">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

          {/* Sección izquierda: Avatar + nombre + badges de relación */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Avatar className="h-20 w-20 border-2 border-gray-200 flex-shrink-0">
              <AvatarImage src={branch.photo?.url || ""} alt={branch.name} />
              <AvatarFallback className="bg-gray-100 text-gray-600 text-lg font-semibold">
                {getInitials(branch.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">
                {branch.name || "Sin nombre"}
              </CardTitle>
              <p className="text-gray-600 text-sm leading-relaxed">
                {branch.description || "Sin descripción disponible"}
              </p>
              {/* Badge de entidad padre con Link */}
              {branch.business && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 mt-2">
                  <Building2 className="h-3 w-3 mr-1" />
                  <Link href={`/dashboard/bussines/${branch.business.id}`}>
                    {branch.business.name}
                  </Link>
                </Badge>
              )}
            </div>
          </div>

          {/* Sección derecha: Contadores/estadísticas */}
          <div className="flex gap-4 lg:flex-shrink-0">
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                <Users className="h-6 w-6 mx-auto text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{branch.employeesCount || 0}</div>
              <div className="text-xs text-gray-500">Empleados</div>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Grid de campos de información */}
      <CardContent className="pt-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {branch.address && <InfoItem icon={<MapPin />} label="Dirección" value={branch.address} />}
          {branch.phone && <InfoItem icon={<Phone />} label="Teléfono" href={`tel:${branch.phone}`} value={branch.phone} />}
          {branch.email && <InfoItem icon={<Mail />} label="Email" href={`mailto:${branch.email}`} value={branch.email} />}
          {branch.createdAt && <InfoItem icon={<Calendar />} label="Creado" value={dayjs(branch.createdAt).format("DD [de] MMMM [de] YYYY")} />}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Patrón de InfoItem (inline en todos los casos)

```tsx
// Se repite inline — no existe como componente separado
<div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
  <Icon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
  <div className="min-w-0 flex-1">
    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
      Label
    </div>
    {/* Valor simple */}
    <div className="text-sm font-medium text-gray-900 break-words">
      {value || "-"}
    </div>
    {/* O valor como enlace */}
    <a href={href} className="text-sm font-medium text-gray-900 break-all hover:text-blue-600">
      {value}
    </a>
  </div>
</div>
```

### Helpers comunes (definidos localmente en cada Header)

```ts
// Iniciales para Avatar fallback
const getInitials = (name: string) =>
  name?.split(" ").map(w => w.charAt(0)).join("").toUpperCase().slice(0, 2);

// Formato de fecha en español
const formatDate = (date: string) =>
  dayjs(date).format("DD [de] MMMM [de] YYYY");

// Capitalizar nombre
const capitalizeName = (name: string) =>
  name?.toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
```

**Reglas:**
- Siempre sin `"use client"` — es Server Component async
- El estado de error con `AlertCircle` va SIEMPRE antes del return principal
- Los campos opcionales se renderizan condicionalmente (`{field && <InfoItem />}`)
- Los links a entidades padre usan `<Badge>` + `<Link>` de Next.js
- `mb-6` en el Card para separarlo del TabSection

---

## 5. Capa 3 — TabSection (Server Component)

**Archivo:** `src/app/dashboard/[entidad]/components/detail/[Entidad]TabSection.tsx`

```tsx
// Sin "use client" — Server Component
import { ITabsProps } from "@/components/tabs/tabs";
import { TabsSection } from "@/components/tabs/TabsSection";
import EmployeeListSection from "@/section/EmployeeListSection";
import ShiftListSection from "@/section/ShiftListSection";

export default function BranchTabSection({ BranchId }: { BranchId: string }) {
  const tabs: ITabsProps[] = [
    {
      name: "Turnos",           // Display name en el tab
      value: "shift",           // Valor en URL: ?tab=shift
      visible: true,            // Si false, el tab no aparece
      count: 0,                 // Badge numérico (0 = no se muestra)
      component: <ShiftListSection branchId={BranchId} />,
    },
    {
      name: "Empleados",
      value: "employees",
      visible: true,
      count: 0,
      component: <EmployeeListSection BranchId={BranchId} />,
    },
    // ... más tabs
  ];

  return <TabsSection TabsContent={tabs} />;
}
```

**Reglas:**
- Sin `"use client"` — Server Component (los ListSection dentro son Client pero el wrapper es Server)
- El id de la entidad padre se pasa a cada `ListSection` como prop para filtrar
- `value` debe ser única, en kebab-case o camelCase simple, sin espacios — es lo que aparece en `?tab=value`
- `visible: false` oculta el tab sin eliminarlo del array (útil para tabs condicionales)
- `count: 0` nunca muestra badge — solo muestra badge si `count > 0`
- El primer tab en el array es el tab activo por defecto
- Los `ListSection` reciben el id con el nombre de prop que tengan definido (inconsistente: algunos `BranchId`, otros `branchId`, otros `businessId`)

### ITabsProps — Tipo completo

```ts
// src/components/tabs/tabs.d.ts
export interface ITabsProps {
  value: string;                        // URL query param
  name: string;                         // Texto del tab
  count: number | null;                 // Badge (null o 0 = oculto)
  icon?: React.ReactElement<TabIconProps>; // Icono opcional
  component: React.ReactNode;           // El componente a renderizar
  visible: boolean;                     // Si aparece o no
}
```

---

## 6. Capa 4 — TabsSection (Client Component compartido)

**Archivo:** `src/components/tabs/TabsSection.tsx`

Este componente es compartido por todas las pantallas de detalle — **no se modifica**, se usa tal cual.

```tsx
"use client";
// Lee ?tab= de la URL
// Al cambiar de tab: router.push(`?tab=${value}`) — REEMPLAZA todos los params
// El tab activo inicial: ?tab= de URL si existe, si no, primer tab del array
// Solo muestra tabs con visible: true
```

**Comportamiento importante:**
- Cuando cambia de tab, **reemplaza todos los query params** con solo `?tab=valor`. Si había `?q=búsqueda` en la URL, se pierde.
- El scroll al tab activo es automático (`.scrollIntoView({ behavior: "smooth", inline: "center" })`)
- Acepta `updateCurrentTab?: (tab: string) => void` como callback opcional para notificar al padre

### Tab — Estilos

```
Activo:   border-b-2 border-BrandColor text-BrandColor font-semibold
Inactivo: text-BrandColor/80 font-semibold (hover añade border-b-2)
Badge:    bg-BrandColor text-white (activo) / border-gray-400 bg-white text-black (inactivo)
```

---

## 7. Capa 5 — Servicio de Detalle (Server-side)

**Archivo:** `src/services/server/[Entidad]/get[Entidad]Detail.ts`

```ts
// DIRECTO a Keystone — no pasa por /api/v1/
import { GET_BRANCH } from "@/graphql/branch/branch.query";
import createApolloClient from "@/infrastructure/createApolloClient";
import { getGraphqlError } from "@/infrastructure/getGraphqlError";

export const getBranchDetail = async (BranchId: string) => {
  if (!BranchId) throw new Error("Branch ID is required");

  try {
    const client = createApolloClient();
    const { data: { branch } } = await client.query({
      query: GET_BRANCH,
      variables: { where: { id: BranchId } },
    });
    return branch;
  } catch (error) {
    const message = getGraphqlError(error);
    console.log("GET BRANCH ERROR: ", message);
    return null; // Siempre retorna null en error (nunca lanza)
  }
};
```

**Reglas:**
- Usa `createApolloClient()` (no el de auth, no el de upload)
- El `where` depende del identificador único del modelo:
  - Por `id`: `{ where: { id: BranchId } }` → query singular `branch(where:)`
  - Por campo único: `{ where: { curp: curp } }` → mismo patrón con Keystone unique field
- Siempre retorna `null` en error — el Header Detail maneja el estado de error
- La validación del parámetro vacío va al inicio (`if (!BranchId) throw`)

---

## 8. Capa 6 — GraphQL Query de Detalle

**Archivo:** `src/graphql/[entidad]/[entidad].query.ts` — agregar junto a las queries de lista

```ts
// Query singular para detalle — más campos que la query de lista
export const GET_BRANCH = gql`
  query Branch($where: BranchWhereUniqueInput!) {
    branch(where: $where) {
      id
      name
      description
      address
      phone
      email
      business {           # ← Relación padre completa para el badge
        id
        name
        photo { url }
      }
      employeesCount       # ← Contadores para las estadísticas
      createdAt
    }
  }
`;
```

**Diferencias con la query de lista:**
- Usa el query **singular** (`branch` no `branches`)
- El `where` es `WhereUniqueInput` (por id o campo único)
- Incluye relaciones anidadas que necesita el Header para mostrar info
- Puede incluir `*Count` fields de Keystone para estadísticas
- Incluye `photo { url }` si la entidad tiene foto

---

## 9. Anatomía del Header Card

Todas las páginas de detalle siguen esta estructura visual:

```
┌─────────────────────────────────────────────────────────┐
│ CardHeader                                               │
│  ┌──────────────────────────────────┐  ┌─────────────┐  │
│  │ [Avatar] Nombre de la entidad    │  │ [Stat 1]    │  │
│  │          Descripción             │  │ [Stat 2]    │  │
│  │          [Badge → Entidad padre] │  │             │  │
│  └──────────────────────────────────┘  └─────────────┘  │
│                                                          │
│ CardContent                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ 📍 Campo │ │ 📞 Campo │ │ ✉️ Campo │ │ 📅 Campo │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Columnas del grid de campos

| Entidades | Columnas lg |
|---|---|
| Business, Branch | `lg:grid-cols-4` |
| Employee | `lg:grid-cols-3` |
| ShiftPlan | Sin grid único, usa múltiples Cards en grids separados |

---

## 10. Variantes de Layout

### Variante A — Header + Tabs (Business, Branch, Employee)

```
Header Card (Avatar + info)
└── TabSection con ListSections relacionadas
```

### Variante B — Solo Header expandido sin Tabs (ShiftPlan)

```
Grid de Cards con información estructurada
└── Sub-componente especializado (ShiftPlanDetailsByDay)
```

ShiftPlan no tiene `TabSection` porque el detalle es auto-contenido (los detalles del plan son parte del mismo objeto, no entidades separadas en otras listas).

### Variante C — Header con lógica de completitud (Employee)

Employee agrega un botón `"Completar información"` con badge de count cuando hay campos nulos. Este es un caso especial específico de esa entidad.

---

## 11. Checklist para crear una Pantalla de Detalle

### GraphQL
- [ ] Agregar `GET_[ENTIDAD]` (singular) a `src/graphql/[entidad]/[entidad].query.ts`
  - Incluir todos los campos a mostrar en el header
  - Incluir relaciones padre con `id`, `name`, `photo`
  - Incluir `*Count` de relaciones hijas si se muestran como estadísticas

### Servicio Server-side
- [ ] Crear `src/services/server/[Entidad]/get[Entidad]Detail.ts`
  - Usa `createApolloClient()`
  - `where` con el identificador único (`id` o campo único)
  - Retorna `null` en error

### Componentes de Detalle
- [ ] `src/app/dashboard/[entidad]/components/detail/Header[Entidad]DetailPage.tsx`
  - Sin `"use client"` — async Server Component
  - Fetch + estado de error con `AlertCircle`
  - Card con Avatar, nombre, descripción, badges de padre, contadores, grid de campos
- [ ] `src/app/dashboard/[entidad]/components/detail/[Entidad]TabSection.tsx` (si hay relaciones)
  - Sin `"use client"` — Server Component
  - Array de `ITabsProps` con `ListSection` filtradas por id
  - `<TabsSection TabsContent={tabs} />`

### Detail Page
- [ ] `src/app/dashboard/[entidad]/[id]/page.tsx`
  - `export const dynamic = "force-dynamic"` al inicio
  - `HeaderDashboard` con `activedbutton={false}` y `detailInfo={id}`
  - breadcrumb con 2 links: lista → detalle
  - `<Suspense>` envolviendo Header + TabSection
- [ ] Habilitar `DetailButton` en `[Entidad]ActionButton.tsx` (descomentar la línea)

---

## 12. Validación — ShiftPlan

Se verificó que **ShiftPlan** (`src/app/dashboard/shiftPlan/[id]/`) sigue el patrón base con variaciones documentadas:

| Patrón | Business | Branch | Employee | ShiftPlan | ✓ |
|---|:---:|:---:|:---:|:---:|:---:|
| `export const dynamic = "force-dynamic"` | ✓ | ✓ | ✓ | ✓ | ✅ |
| `HeaderDashboard` con `activedbutton={false}` | ✓ | ✓ | ✓ | ✓ | ✅ |
| `detailInfo={id}` en breadcrumb | ✓ | ✓ | ✓ | ✓ | ✅ |
| `<Suspense>` con `<ListLoader>` | ✓ | ✓ | ✓ | ✓ | ✅ |
| Header async Server Component | ✓ | ✓ | ✓ | ✓ | ✅ |
| Estado de error con `AlertCircle` | ✓ | ✓ | ✓ | ✓ | ✅ |
| `createApolloClient()` en service | ✓ | ✓ | ✓ | ✓ | ✅ |
| `GET_*` query singular con más campos | ✓ | ✓ | ✓ | ✓ | ✅ |
| TabSection con `ITabsProps[]` | ✓ | ✓ | ✓ | ✗ | ✅ (variante B) |
| Avatar + nombre + descripción en Card | ✓ | ✓ | ✓ | ✗ | ✅ (variante B) |
| Grid de campos con icono + label + valor | ✓ | ✓ | ✓ | ✓ (en Cards) | ✅ |
| Badge con Link a entidad padre | ✓ | ✓ | ✗ | ✓ (texto) | ✅ |

**Diferencias documentadas de ShiftPlan:**
- No usa `TabSection` — los detalles del plan son parte del mismo objeto GraphQL
- No tiene `Avatar` — usa múltiples `Card` en un grid para organizar la información por categoría
- Incluye sub-componente `ShiftPlanDetailsByDay` para renderizar datos complejos anidados
- Usa `dayjs().format("DD/MM/YYYY HH:mm")` para mostrar fechas con hora (no solo fecha)
