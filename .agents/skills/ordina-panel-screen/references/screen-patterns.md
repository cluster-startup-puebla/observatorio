# Documentación: Cómo Crear una Pantalla en ordina-panel

Esta guía describe el patrón completo para crear una nueva pantalla (entidad) en el admin panel. Se analizaron las pantallas de **Roles** y **Negocios (Business)** como fuente principal, y se validó contra **Sucursales (Branch)** al final.

---

## Índice

1. [Visión General de la Arquitectura](#1-visión-general-de-la-arquitectura)
2. [Capas del Sistema](#2-capas-del-sistema)
3. [Flujo Completo de una Pantalla](#3-flujo-completo-de-una-pantalla)
4. [Capa 1 — Page (Server Component)](#4-capa-1--page-server-component)
5. [Capa 2 — HeaderPage (Client Component)](#5-capa-2--headerpage-client-component)
6. [Capa 3 — FormWrapper (Client Component)](#6-capa-3--formwrapper-client-component)
7. [Capa 4 — ListSection (Client Component)](#7-capa-4--listsection-client-component)
8. [Capa 5 — Table (Client Components)](#8-capa-5--table-client-components)
9. [Capa 6 — Stores Zustand](#9-capa-6--stores-zustand)
10. [Capa 7 — Hooks de Submit](#10-capa-7--hooks-de-submit)
11. [Capa 8 — Servicios Cliente](#11-capa-8--servicios-cliente)
12. [Capa 9 — API Routes (Next.js)](#12-capa-9--api-routes-nextjs)
13. [Capa 10 — GraphQL Queries y Mutations](#13-capa-10--graphql-queries-y-mutations)
14. [Pantalla de Detalle](#14-pantalla-de-detalle)
15. [Componentes Compartidos Clave](#15-componentes-compartidos-clave)
16. [Checklist para Crear una Pantalla Nueva](#16-checklist-para-crear-una-pantalla-nueva)
17. [Validación — Pantalla de Sucursales](#17-validación--pantalla-de-sucursales)

---

## 1. Visión General de la Arquitectura

```
Browser
  │
  ▼
src/app/dashboard/[entidad]/page.tsx          ← Server Component (SSR)
  │  ├── HeaderPage (Client)                  ← Header + botón + SlideOver con form
  │  └── ListSection (Client)                 ← Fetches data y muestra tabla
  │        └── AllEntityTable                 ← DataTable + columnas + ActionButton
  │
  ├── /api/v1/[entidad]/create  (POST)        ← API Route autenticada
  ├── /api/v1/[entidad]/pagination (GET)      ← API Route autenticada
  ├── /api/v1/[entidad]/softDelete (PUT)      ← API Route autenticada
  │
  ▼
internal-ordina-core (Keystone GraphQL)       ← Backend único
```

**Regla fundamental:** El frontend NUNCA llama directamente a Keystone. Todo pasa por las API Routes de Next.js (`/api/v1/...`), que actúan como BFF (Backend For Frontend) y aplican autenticación.

---

## 2. Capas del Sistema

| Capa | Ubicación | Rol |
|---|---|---|
| Page (SSR) | `src/app/dashboard/[entidad]/page.tsx` | Server Component, trae metadatos del form |
| HeaderPage | `src/app/dashboard/[entidad]/components/Header[Entidad]Page.tsx` | Client Component, header + SlideOver |
| FormWrapper | `src/app/dashboard/[entidad]/components/[Entidad]FormWrapper.tsx` | Envuelve DynamicForm con overrides |
| ListSection | `src/section/[Entidad]ListSection.tsx` | Fetch client-side, loading/empty states |
| Table | `src/table/[Entidad]Table/` | Columnas TanStack + ActionButton |
| DataTable | `src/table/DataTable.tsx` | Tabla genérica con paginación y búsqueda |
| Hooks | `src/app/dashboard/[entidad]/hooks/` | Lógica de submit + SlideOver |
| Stores | `src/store/` | Estado global (refresh, form) |
| Servicios Client | `src/services/client/[entidad]/` | Llaman a `/api/v1/...` via axios |
| API Routes | `src/app/api/v1/[entidad]/[operacion]/` | Route handlers autenticados |
| Servicios Server | `src/app/api/v1/[entidad]/[operacion]/` | Llaman a Keystone via Apollo |
| GraphQL | `src/graphql/[entidad]/` | Queries y mutations gql |

---

## 3. Flujo Completo de una Pantalla

### Flujo de Carga (Lista)

```
1. Usuario navega a /dashboard/roles
2. Server Component (page.tsx) ejecuta getFormData({ key: "Role" })
   → Consulta adminMeta de Keystone para obtener fields del form
3. Se renderizan HeaderRolesPage y RoleListSection
4. RoleListSection ejecuta useEffect → getRoleClient(1)
   → GET /api/v1/Role/pagination?page=1
   → API Route llama a paginationRole() (Apollo → Keystone GraphQL)
5. Se renderiza AllRolesTable con los datos
```

### Flujo de Crear (POST)

```
1. Usuario hace clic en "Nuevo Role" en el header
2. openSlideOver() → slideOverRef.current?.show()
3. SlideOver se abre mostrando RolesFormWrapper
4. RolesFormWrapper renderiza DynamicForm con los campos de adminMeta
5. Usuario llena el form y hace submit
6. handleRoleSubmit(data) en useRoleSubmit se ejecuta
7. Llama a addNewRoleClient(data)
   → POST /api/v1/Role/create (autenticado)
   → Controller valida → Service llama a CREATE_ROLE mutation (Keystone)
8. En éxito: toast.success, closeSlideOver(), router.refresh(), needRefresh()
9. ListSection re-fetcha al detectar el cambio en refreshStore
```

### Flujo de Eliminar (Soft Delete)

```
1. Usuario hace clic en el botón de eliminar en la tabla (RoleActionButton)
2. Modal de confirmación se abre
3. Usuario confirma → handleRoleDelete()
4. Llama a softRemoveRoleClient({ id })
   → PUT /api/v1/Role/softDelete
   → Service llama a UPDATE_ROLE mutation con { deleted: true }
5. En éxito: toast.success, router.refresh(), needRefresh()
6. ListSection re-fetcha automáticamente
```

---

## 4. Capa 1 — Page (Server Component)

**Archivo:** `src/app/dashboard/[entidad]/page.tsx`

```tsx
// Ejemplo: roles/page.tsx
import { Metadata } from "next";
import { APP_NAME, APP_TAGLINE } from "@/config";
import HeaderRolesPage from "./components/HeaderRolesPage";
import getFormData from "@/services/server/forms/getFormData";
import RoleListSection from "@/section/RoleListSection";

export const metadata: Metadata = {
  title: `${APP_NAME} | Roles | ${APP_TAGLINE}`,
  description: "Descripción para SEO...",
};

export default async function RolesPage() {
  const formData = await getFormData({ key: "Role" }); // ← KEY de Keystone
  return (
    <>
      <HeaderRolesPage
        title={formData?.label}
        links={linksRolesPages}
        formData={formData}
        textbutton={`Nuevo ${formData?.label}`}
      />
      <RoleListSection />
    </>
  );
}

const linksRolesPages = [
  { name: "Roles", href: "/dashboard/roles" },
];
```

**Reglas:**
- Siempre es un Server Component async (no tiene `"use client"`)
- Siempre llama a `getFormData({ key: "KeystoneModelKey" })` — la key debe coincidir exactamente con el nombre del modelo en Keystone
- Exporta `metadata` de Next.js
- Pasa `formData` al Header para que el formulario sea dinámico
- Puede envolver `ListSection` en `<Suspense>` con `<ListLoader>` como fallback (patrón en Business y Branch)

**getFormData** consulta la API de adminMeta de Keystone para obtener la definición de campos del modelo. Devuelve:
```ts
type AdminList = {
  key: string;
  label: string;
  fields: AdminField[];  // Cada campo con su tipo, label, path, etc.
};
```

---

## 5. Capa 2 — HeaderPage (Client Component)

**Archivo:** `src/app/dashboard/[entidad]/components/Header[Entidad]Page.tsx`

```tsx
"use client";
import HeaderDashboard from "@/components/dashboard/HeaderDashboard";
import SlideOver from "@/components/sideOver/slideOver";
import RolesFormWrapper from "./RolesFormWrapper";
import { useSlideOver } from "@/app/dashboard/bussines/hooks/useBusinessHooks";
import { useRoleSubmit } from "../hooks/useRoleHooks";

export default function HeaderRolesPage({ title, links, formData, textbutton }) {
  const { slideOverRef, openSlideOver, closeSlideOver } = useSlideOver();
  const { handleRoleSubmit } = useRoleSubmit(closeSlideOver);

  return (
    <>
      <HeaderDashboard
        text={title}
        links={links}
        activedbutton={true}
        textbutton={textbutton}
        iconbutton="ic:round-admin-panel-settings"  // Iconify icon
        action={openSlideOver}
      />
      <SlideOver ref={slideOverRef} title="Nuevo Role">
        <Suspense fallback={<div>Cargando formulario...</div>}>
          {formData ? (
            <RolesFormWrapper formData={formData} onSubmit={handleRoleSubmit} />
          ) : (
            <div>Error al cargar los metadatos del formulario</div>
          )}
        </Suspense>
      </SlideOver>
    </>
  );
}
```

**Reglas:**
- Siempre `"use client"` al inicio
- Usa `useSlideOver()` (hook genérico) para entidades simples, o `useBusinessForm()` para entidades que soportan edición inline vía `useFormStore`
- `SlideOver` se controla con `forwardRef` + `useImperativeHandle` — nunca estado local directo
- `HeaderDashboard` recibe `action` (callback para abrir el SlideOver) y `activedbutton={true}` para mostrar el botón
- Si no hay `formData`, el componente muestra `activedbutton={false}` (sin botón)
- El título del SlideOver es fijo en el componente (ej: "Nuevo Role")

### Variante con soporte Create/Edit (useBusinessForm)

Cuando la entidad soporta tanto crear como editar desde el mismo SlideOver, se usa `useFormStore`:

```tsx
const { title: formTitle, isOpen, mode, closeForm } = useFormStore();
const { slideOverRef, openCreateForm, closeSlideOver } = useBusinessForm();
```

El título del SlideOver viene de `formStore.title` (dinámico: "Crear Empresa" / "Editar Empresa").

---

## 6. Capa 3 — FormWrapper (Client Component)

**Archivo:** `src/app/dashboard/[entidad]/components/[Entidad]FormWrapper.tsx`

### Versión simple (solo create)

```tsx
"use client";
import { DynamicForm } from "@/components/dynamicForm/DynamicForm";
import { AdminList } from "@/services/server/forms/getFormData";

type Props = {
  formData: AdminList;
  onSubmit: (data: any) => void;
};

export default function RolesFormWrapper({ formData, onSubmit }: Props) {
  return (
    <DynamicForm
      adminList={formData}
      onSubmit={onSubmit}
      overrides={{
        hide: ["id", "createdAt", "updatedAt", "employees", "users", "deleted"],
      }}
    />
  );
}
```

### Versión con create/edit (useFormStore)

```tsx
"use client";
import { DynamicForm } from "@/components/dynamicForm/DynamicForm";
import useFormStore from "@/store/formStore";

export default function BusinessFormWrapper({ formData, onSubmit }) {
  const { mode, data: editData } = useFormStore();

  if (mode === "create") {
    return (
      <DynamicForm
        adminList={formData}
        onSubmit={onSubmit}
        overrides={{ hide: ["id", "createdAt", "updatedAt", "deleted", ...] }}
      />
    );
  }

  if (mode === "edit" && editData) {
    return (
      <DynamicForm
        adminList={formData}
        onSubmit={onSubmit}
        initialData={editData}        // Prellenar datos existentes
        noEditField={["name"]}        // Campos de solo lectura en edición
        overrides={{ hide: [...] }}
      />
    );
  }

  return <div>Error: Modo no válido</div>;
}
```

**Props de DynamicForm:**

| Prop | Tipo | Descripción |
|---|---|---|
| `adminList` | `AdminList` | Metadatos del form desde Keystone |
| `onSubmit` | `(data) => void` | Handler de submit |
| `overrides.hide` | `string[]` | Campos a ocultar (siempre incluir: `id`, `createdAt`, `updatedAt`, `deleted`) |
| `overrides.makeReadOnly` | `string[]` | Campos de solo lectura |
| `initialData` | `any` | Datos para modo edición |
| `noEditField` | `string[]` | Campos que se muestran pero no se pueden editar |
| `customFields` | `{ [key: string]: ComponentType }` | Componentes personalizados para campos específicos (ej: búsqueda de relaciones) |

**Regla:** Los campos `id`, `createdAt`, `updatedAt`, `deleted` siempre van en `overrides.hide`. Las relaciones complejas (hasMany) también se ocultan normalmente.

### customFields — Campos de Relación

Cuando un campo es una relación (FK), en vez del input default de `DynamicForm` se usa un componente de búsqueda personalizado:

```tsx
// En BranchFormWrapper:
customFields={{ business: BussinesSearchComponent }}
```

Los componentes de búsqueda viven en `src/components/search/`.

---

## 7. Capa 4 — ListSection (Client Component)

**Archivo:** `src/section/[Entidad]ListSection.tsx`

```tsx
"use client";
import { ListEmpty } from "./ListEmpty";
import useRefreshStore from "@/store/refreshStore";
import { useState, useEffect } from "react";
import { ListLoader } from "./ListLoader";
import { getRoleClient } from "@/services/client/Role/pagination";
import AllRolesTable from "@/table/RolesTable/AllRolesTable";

export default function RoleListSection() {
  const { refresh, refreshed } = useRefreshStore();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<any[]>([]);
  const [totalRow, setTotalRow] = useState(0);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const result = await getRoleClient(1);
        setRoles(result?.roleList || []);
        setTotalRow(result?.totalRow || 0);
      } catch (error) {
        console.error("[getRolesClient] - Error getting roles", error);
      } finally {
        setLoading(false);
        refreshed(); // ← Marcar que ya se refrescó
      }
    };
    fetchRoles();
  }, [refresh]); // ← Re-ejecuta cuando needRefresh() es llamado

  if (loading) return <ListLoader size="large" />;
  if (!loading && roles.length === 0) {
    return (
      <ListEmpty
        icon="ic:round-admin-panel-settings"
        size="large"
        complementText="Empieza creando un rol"
      />
    );
  }

  return (
    <section className="my-5">
      <AllRolesTable data={roles} totalRow={totalRow} />
    </section>
  );
}
```

**Reglas:**
- El `useEffect` depende de `refresh` de `useRefreshStore` para re-fetchear tras CRUD
- Siempre llamar `refreshed()` en el `finally` del fetch
- Los tres estados posibles: loading → empty → table
- `ListLoader` y `ListEmpty` son componentes genéricos compartidos
- La sección acepta props opcionales para filtrar por entidad padre (ej: `BussinesId?: string`)

**Secciones con filtros opcionales:**

```tsx
// BranchesListSection acepta filtrado por negocio
export default function BranchesListSection({ BussinesId }: { BussinesId?: string }) {
  // ...
  const result = await getBranchClient(1, null, BussinesId);
  // ...
}
```

---

## 8. Capa 5 — Table (Client Components)

### All[Entidad]Table

**Archivo:** `src/table/[Entidad]Table/All[Entidad]Table.tsx`

```tsx
"use client";
import DataTable from "../DataTable";
import { getRoleClient } from "@/services/client/Role/pagination";
import { getRolesColumns } from "./getRolesColumns";

function AllRolesTable({ data, totalRow }) {
  const columns = getRolesColumns();

  const getResultsPerPage = async (pageNumber: number, searchValue?: string) => {
    const result = await getRoleClient(pageNumber, searchValue);
    return result?.roleList || [];
  };

  const getResultCount = async (searchValue?: string): Promise<number> => {
    const result = await getRoleClient(1, searchValue);
    return result?.totalRow || 0;
  };

  return (
    <DataTable
      data={data}
      columns={columns}
      dataTotalCount={totalRow}
      handlerChangeTableData={getResultsPerPage}
      handlerChangeDataCount={getResultCount}
      externalSearch={true}
    />
  );
}
```

### get[Entidad]Columns

**Archivo:** `src/table/[Entidad]Table/get[Entidad]Columns.tsx`

```tsx
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import RoleActionButton from "./RoleActionButton";

export const getRolesColumns = (): ColumnDef<any>[] => [
  {
    header: "Nombre",
    accessorKey: "name",
    enableSorting: false,
    cell: (info) => {
      const name = info.row.original.name;
      return name ? name.toUpperCase() : "-";
    },
  },
  {
    header: "Descripción",
    accessorKey: "description",
    enableSorting: false,
    cell: (info) => info.row.original.description || "-",
  },
  {
    header: "Creado",
    accessorKey: "dateCreated",
    enableSorting: false,
    cell: (info) => {
      const date = info.row.original.dateCreated;
      return date ? dayjs(date).format("DD/MM/YYYY") : "-";
    },
  },
  {
    header: "Acciones",
    cell: ({ row }) => <RoleActionButton id={row.original.id} data={row.original} />,
  },
];
```

**Reglas:**
- `enableSorting: false` en todas las columnas (el sorting server-side no está implementado)
- La última columna es siempre `"Acciones"` con el `ActionButton`
- Usar `dayjs` para formatear fechas: `dayjs(date).format("DD/MM/YYYY")`
- Valores nulos siempre retornan `"-"`

### [Entidad]ActionButton

**Archivo:** `src/table/[Entidad]Table/[Entidad]ActionButton.tsx`

```tsx
import React, { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import Modal, { ModalRef } from "@/components/modals/Modal";
import DeleteModal from "@/components/modals/DeleteModal";
import { softRemoveRoleClient } from "@/services/client/Role/softDelete";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import useRefreshStore from "@/store/refreshStore";

export default function RoleActionButton({ id, data }) {
  const modalRef = useRef<ModalRef>(null);
  const [loadingDeleteRole, setLoadingDeleteRole] = useState(false);
  const { needRefresh } = useRefreshStore();
  const router = useRouter();

  const handleRoleDelete = async () => {
    setLoadingDeleteRole(true);
    const deletedRole = await softRemoveRoleClient({ id });
    setLoadingDeleteRole(false);

    if (deletedRole) {
      toast.success("Rol eliminado con éxito", { icon: "🗑️", duration: 5000 });
      router.refresh();
      needRefresh();
      modalRef.current?.hide();
      return true;
    } else {
      toast.error("Error al eliminar rol, inténtalo de nuevo", { icon: "⚠️" });
      return false;
    }
  };

  return (
    <div className="flex">
      {/* Botón de detalle (opcional): */}
      {/* <DetailButton href={`/dashboard/roles/${id}`} showIcon={true} /> */}

      <button
        onClick={() => modalRef.current?.show()}
        className="inline-block text-white border border-red-500 bg-red-500 font-medium rounded-lg text-xs px-3 py-2.5 me-1 mb-2 mr-2"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <Modal ref={modalRef} title="Confirmar Eliminación">
        <DeleteModal
          onCancel={() => modalRef.current?.hide()}
          onConfirm={handleRoleDelete}
          loading={loadingDeleteRole}
          entityName="Rol"
        />
      </Modal>
    </div>
  );
}
```

**Reglas:**
- El Modal de confirmación usa `useRef<ModalRef>` para control imperativo
- Siempre llama `router.refresh()` + `needRefresh()` tras eliminar
- El soft delete marca `deleted: true` en Keystone via `UPDATE_*` mutation (no elimina el registro)
- El botón de detalle `DetailButton` está disponible pero puede estar comentado si la pantalla de detalle no existe aún

### DataTable (Genérico)

**Archivo:** `src/table/DataTable.tsx`

Props clave:

| Prop | Descripción |
|---|---|
| `data` | Array inicial de datos |
| `columns` | Columnas TanStack Table |
| `dataTotalCount` | Total de registros para paginación |
| `handlerChangeTableData` | `(page, search) => Promise<T[]>` — para paginación server-side |
| `handlerChangeDataCount` | `(search) => Promise<number>` — para conteo con búsqueda |
| `externalSearch` | `true` para búsqueda server-side, `false` para client-side |
| `showSearchInput` | `true` por defecto |

**Comportamiento:**
- Paginación de 10 registros por página (hardcoded en los services)
- Búsqueda con debounce de 500ms
- Actualiza query params de URL con `?q=búsqueda`
- Filas inactivas (`isAvailable === false || isActive === false`) se muestran con fondo gris

---

## 9. Capa 6 — Stores Zustand

### refreshStore

**Archivo:** `src/store/refreshStore.ts`

```ts
const useRefreshStore = create<RefreshStore>()(
  persist(
    (set) => ({
      refresh: false,
      needRefresh: () => set({ refresh: true }),   // Trigger re-fetch
      refreshed: () => set({ refresh: false }),     // Reset tras fetch
    }),
    { name: "refresh-store" }
  )
);
```

**Uso:**
- En ActionButton y hooks de submit: `needRefresh()` después de CRUD
- En ListSection: `const { refresh, refreshed } = useRefreshStore()` — `refresh` en deps del useEffect

### formStore

**Archivo:** `src/store/formStore.ts`

```ts
const useFormStore = create<FormState>((set) => ({
  mode: null,        // "create" | "edit" | null
  data: null,        // Datos para modo edit
  title: "",         // Título del SlideOver
  isOpen: false,
  openForm: (mode, data, title) => set({ mode, data, title, isOpen: true }),
  closeForm: () => set({ mode: null, data: null, title: "", isOpen: false }),
}));
```

**Uso:** Solo en entidades que soportan edición inline (ej: Business). En entidades más simples (Roles), no se usa `formStore`.

---

## 10. Capa 7 — Hooks de Submit

**Archivo:** `src/app/dashboard/[entidad]/hooks/use[Entidad]Hooks.ts`

### Hook Simple (useSlideOver — reutilizable)

```ts
// Exportado desde useBusinessHooks.ts — se reutiliza en múltiples entidades
export const useSlideOver = () => {
  const slideOverRef = useRef<SlideOverRef>(null);
  const openSlideOver = () => slideOverRef.current?.show();
  const closeSlideOver = () => slideOverRef.current?.hide();
  return { slideOverRef, openSlideOver, closeSlideOver };
};
```

### Hook de Submit

```ts
export const useRoleSubmit = (closeSlideOver: () => void) => {
  const router = useRouter();
  const { needRefresh } = useRefreshStore();

  const handleRoleSubmit = async (data): Promise<boolean> => {
    // Validaciones opcionales...

    const loadingToast = toast.loading("Creando el rol...");

    try {
      const createdRole = await addNewRoleClient(data);

      if (createdRole) {
        toast.dismiss(loadingToast);
        toast.success("El rol ya está disponible en el sistema", { icon: "✅" });
        closeSlideOver();
        router.refresh();
        needRefresh();
        return true;
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error al crear el rol");
      return false;
    }
  };

  return { handleRoleSubmit };
};
```

**Reglas:**
- El hook recibe `closeSlideOver` como parámetro
- En éxito: `closeSlideOver()` → `router.refresh()` → `needRefresh()`
- Usa `toast.loading` + `toast.dismiss` para feedback durante la operación
- Retorna `boolean` para indicar éxito/fallo

---

## 11. Capa 8 — Servicios Cliente

**Ubicación:** `src/services/client/[entidad]/[operacion]/index.ts`

Todos usan `coreInstances` (axios) que apunta a `/api/v1/...`.

```ts
// coreInstances: axios configurado con baseURL dinámica
// SSR: http://localhost:3000/api/v1
// Browser: process.env.NEXT_PUBLIC_baseURL
```

### Patrón create

```ts
export const addNewRoleClient = async (data) => {
  try {
    const RoleSaved = await coreInstances.post(`/role/create`, data);
    return RoleSaved.data;
  } catch (error) {
    console.error("[createNewRole] - Error creating Role", error);
    return null;
  }
};
```

### Patrón pagination

```ts
export const getRoleClient = async (
  currentPage: number,
  search?: string
): Promise<{ roleList: any[]; totalRow: number } | null> => {
  try {
    const roleList = await coreInstances.get(`/role/pagination`, {
      params: { page: currentPage, ...(search && { search }) },
    });
    return roleList.data.data;
  } catch (error) {
    console.error("[roleList]- Error getting role", error);
    return null;
  }
};
```

### Patrón softDelete

```ts
export const softRemoveRoleClient = async ({ id }) => {
  try {
    const roleSoftDeleted = await coreInstances.put(`/role/softDelete`, { id });
    return roleSoftDeleted.data.data;
  } catch (error) {
    return null;
  }
};
```

**Regla:** Siempre retornan `null` en error (nunca lanzan excepciones). El caller maneja el `null`.

---

## 12. Capa 9 — API Routes (Next.js)

**Ubicación:** `src/app/api/v1/[entidad]/[operacion]/`

Cada operación tiene tres archivos:

```
route.ts                       ← Handler HTTP autenticado
[entidad][operacion].controller.ts  ← Valida input, llama al service
[entidad][operacion].services.ts    ← Apollo Client → Keystone GraphQL
```

### route.ts

```ts
import { auth } from "auth";
import { addNewRole } from "./Rolecreate.controller";

export const POST = auth(async (req) => {
  if (!req.auth) {
    return Response.json({ message: "Not authenticated" }, { status: 401 });
  }

  const data = await req.json();
  const dataTransform = await validateRequest(data, ["name", "description"]);

  try {
    const roleAddNew = await addNewRole({ ...dataTransform, email: req.auth.user.email });
    return Response.json({ data: roleAddNew }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

**Reglas:**
- Usa `auth(async (req) => ...)` wrapper de NextAuth para proteger la ruta
- Siempre valida `!req.auth` → 401
- Siempre valida campos requeridos con `validateRequest`
- GET para pagination, POST para create, PUT para softDelete

### controller.ts

```ts
export const addNewRole = async (data) => {
  if (!data.name || !data.description) {
    throw new Error("[addNewRole] - name and description are required");
  }
  const roleAddNew = await createRole(data); // ← llama al service
  return roleAddNew;
};
```

### services.ts (el que toca GraphQL)

```ts
import { CREATE_ROLE } from "@/graphql/role/role.mutation";
import createApolloClient from "@/infrastructure/createApolloClient";

const createRole = async (data) => {
  const client = createApolloClient();
  const result = await client.mutate({
    mutation: CREATE_ROLE,
    variables: { data: { name: data.name, description: data.description } },
  });
  return result.data.createRole;
};
```

**Infraestructura Apollo:**
- `createApolloClient()` — cliente básico para server-side
- `createApolloClientWithLink()` — cliente con auth token (para `getFormData`)
- `createApolloClientWithUpload()` — cliente para subida de archivos

---

## 13. Capa 10 — GraphQL Queries y Mutations

**Ubicación:** `src/graphql/[entidad]/`

### [entidad].query.ts

```ts
import { gql } from "@apollo/client";

export const GET_ROLES = gql`
  query Roles(
    $where: RoleWhereInput!
    $orderBy: [RoleOrderByInput!]!
    $take: Int
    $skip: Int!
  ) {
    roles(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
      id
      name
      description
      dateCreated
    }
  }
`;

export const GET_ROLES_COUNT = gql`
  query Query($where: RoleWhereInput!) {
    rolesCount(where: $where)
  }
`;

// Para búsqueda typeahead en CustomFields
export const SEARCH_ROLES = gql`
  query Roles($where: RoleWhereInput!) {
    roles(where: $where) { name id }
  }
`;
```

### [entidad].mutation.ts

```ts
export const CREATE_ROLE = gql`
  mutation CreateRole($data: RoleCreateInput!) {
    createRole(data: $data) { id }
  }
`;

// El softDelete reutiliza UPDATE_ROLE con { deleted: true }
export const UPDATE_ROLE = gql`
  mutation UpdateRole($where: RoleWhereUniqueInput!, $data: RoleUpdateInput!) {
    updateRole(where: $where, data: $data) { id }
  }
`;
```

**Regla de soft delete:** No existe `DELETE_*` mutation. El borrado es lógico: se llama a `UPDATE_*` con `{ deleted: true }`. Los queries siempre filtran `{ deleted: { equals: false } }`.

---

## 14. Pantalla de Detalle

**Archivo:** `src/app/dashboard/[entidad]/[id]/page.tsx`

```tsx
export const dynamic = "force-dynamic"; // ← Importante: fuerza SSR en cada request

export default function BussinesDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <section>
      <HeaderDashboard
        text="Detalles del negocio"
        links={linksBussinesDetail(id)}
        activedbutton={false}      // Sin botón de crear en detalle
        textbutton=""
        iconbutton=""
        detailInfo={`${id}`}       // Muestra el ID en el breadcrumb
      />
      <Suspense fallback={<ListLoader size="large" />}>
        <section className="rounded-2xl my-10">
          <HeaderBussineDetailPage BussinesId={id} />  {/* Fetch + info card */}
          <BussinesTabSection BussinesId={id} />        {/* Tabs con relaciones */}
        </section>
      </Suspense>
    </section>
  );
}
```

### Header de Detalle

```tsx
// Server Component async — hace fetch directo a GraphQL
export default async function HeaderBussineDetailPage({ BussinesId }) {
  const business = await getBussinesDetail(BussinesId); // ← Service server-side

  if (!business) {
    return <Card>...</Card>; // Error state
  }

  return (
    <Card>
      {/* Avatar, nombre, stats, datos de contacto */}
    </Card>
  );
}
```

El service de detalle usa Apollo directamente (no via `/api/v1`):

```ts
export const getBussinesDetail = async (BussinesId: string) => {
  const client = createApolloClient();
  const { data: { business } } = await client.query({
    query: GET_BUSINESS,
    variables: { where: { id: BussinesId } },
  });
  return business;
};
```

### TabSection de Detalle

```tsx
export default function BussinesTabSection({ BussinesId }) {
  const tabs: ITabsProps[] = [
    {
      name: "Sucursales",
      value: "branches",
      visible: true,
      count: 0,
      component: <BranchesListSection BussinesId={BussinesId} />,
    },
    // ... más tabs
  ];
  return <TabsSection TabsContent={tabs} />;
}
```

Los tabs reutilizan los `ListSection` existentes pasando el ID del padre como filtro.

---

## 15. Componentes Compartidos Clave

| Componente | Ubicación | Uso |
|---|---|---|
| `HeaderDashboard` | `src/components/dashboard/HeaderDashboard.tsx` | Header con breadcrumb y botón de acción |
| `SlideOver` | `src/components/sideOver/slideOver.tsx` | Panel lateral para formularios |
| `DynamicForm` | `src/components/dynamicForm/DynamicForm.tsx` | Form genérico basado en adminMeta de Keystone |
| `DataTable` | `src/table/DataTable.tsx` | Tabla con paginación y búsqueda |
| `ListLoader` | `src/section/ListLoader.tsx` | Skeleton de carga |
| `ListEmpty` | `src/section/ListEmpty.tsx` | Estado vacío con icono |
| `Modal` | `src/components/modals/Modal.tsx` | Modal imperativo con ref |
| `DeleteModal` | `src/components/modals/DeleteModal.tsx` | Confirmación de eliminación |
| `DetailButton` | `src/components/actionButton/detailButton.tsx` | Botón de enlace al detalle |
| `TabsSection` | `src/components/tabs/TabsSection.tsx` | Tabs para pantallas de detalle |

---

## 16. Checklist para Crear una Pantalla Nueva

### GraphQL
- [ ] Crear `src/graphql/[entidad]/[entidad].query.ts` con `GET_[ENTIDAD]S`, `GET_[ENTIDAD]S_COUNT`, y `SEARCH_[ENTIDAD]S`
- [ ] Crear `src/graphql/[entidad]/[entidad].mutation.ts` con `CREATE_[ENTIDAD]` y `UPDATE_[ENTIDAD]`

### API Routes
- [ ] `src/app/api/v1/[entidad]/create/route.ts` — POST autenticado
- [ ] `src/app/api/v1/[entidad]/create/[entidad]create.controller.ts`
- [ ] `src/app/api/v1/[entidad]/create/[entidad]create.services.ts`
- [ ] `src/app/api/v1/[entidad]/pagination/route.ts` — GET autenticado
- [ ] `src/app/api/v1/[entidad]/pagination/[entidad]pagination.controller.ts`
- [ ] `src/app/api/v1/[entidad]/pagination/[entidad]pagination.services.ts`
- [ ] `src/app/api/v1/[entidad]/softDelete/route.ts` — PUT autenticado
- [ ] `src/app/api/v1/[entidad]/softDelete/[entidad]softDelete.controller.ts`
- [ ] `src/app/api/v1/[entidad]/softDelete/[entidad]softDelete.services.ts`

### Servicios Cliente
- [ ] `src/services/client/[entidad]/create/index.ts`
- [ ] `src/services/client/[entidad]/pagination/index.ts`
- [ ] `src/services/client/[entidad]/softDelete/index.ts`

### Table
- [ ] `src/table/[Entidad]Table/get[Entidad]Columns.tsx`
- [ ] `src/table/[Entidad]Table/[Entidad]ActionButton.tsx`
- [ ] `src/table/[Entidad]Table/All[Entidad]Table.tsx`

### Section
- [ ] `src/section/[Entidad]ListSection.tsx`

### Dashboard Page
- [ ] `src/app/dashboard/[entidad]/page.tsx` (Server Component, con metadata)
- [ ] `src/app/dashboard/[entidad]/components/Header[Entidad]Page.tsx`
- [ ] `src/app/dashboard/[entidad]/components/[Entidad]FormWrapper.tsx`
- [ ] `src/app/dashboard/[entidad]/hooks/use[Entidad]Hooks.ts`

### Detalle (opcional)
- [ ] `src/app/dashboard/[entidad]/[id]/page.tsx` (con `export const dynamic = "force-dynamic"`)
- [ ] `src/app/dashboard/[entidad]/components/detail/Header[Entidad]DetailPage.tsx`
- [ ] `src/app/dashboard/[entidad]/components/detail/[Entidad]TabSection.tsx`
- [ ] `src/services/server/[Entidad]/get[Entidad]Detail.ts`

---

## 17. Validación — Pantalla de Sucursales

Se verificó que la pantalla de **Sucursales (Branch)** sigue el mismo patrón documentado.

### Cobertura verificada ✅

| Patrón | Roles | Business | Branch | ✓ |
|---|:---:|:---:|:---:|:---:|
| `page.tsx` async Server Component | ✓ | ✓ | ✓ | ✅ |
| `getFormData({ key })` en page | `"Role"` | `"Business"` | `"Branch"` | ✅ |
| `Header[X]Page` con `SlideOver` | ✓ | ✓ | ✓ | ✅ |
| `useSlideOver()` o `useBusinessForm()` | `useSlideOver` | `useBusinessForm` | `useSlideOver` | ✅ |
| `[X]FormWrapper` con `DynamicForm` | ✓ | ✓ | ✓ | ✅ |
| `overrides.hide` con campos system | ✓ | ✓ | ✓ | ✅ |
| `[X]ListSection` con `useRefreshStore` | ✓ | ✓ | ✓ | ✅ |
| `All[X]Table` + `DataTable` | ✓ | ✓ | ✓ | ✅ |
| `get[X]Columns()` con col. Acciones | ✓ | ✓ | ✓ | ✅ |
| `[X]ActionButton` con Modal de confirm | ✓ | ✓ | ✓ | ✅ |
| Soft delete via `UPDATE_*` mutation | ✓ | ✓ | ✓ | ✅ |
| `toast` feedback en operaciones | ✓ | ✓ | ✓ | ✅ |
| `router.refresh()` + `needRefresh()` | ✓ | ✓ | ✓ | ✅ |
| API Route autenticada con `auth()` | ✓ | ✓ | ✓ | ✅ |
| Controller + Service separados | ✓ | ✓ | ✓ | ✅ |
| GraphQL via Apollo en services | ✓ | ✓ | ✓ | ✅ |
| Pantalla de detalle con `[id]/page.tsx` | ✗ | ✓ | ✓ | ✅ |
| `TabsSection` con ListSections anidadas | ✗ | ✓ | ✓ | ✅ |
| `customFields` para relaciones FK | ✗ | ✗ | `business` | ✅ |
| Soporte create/edit con `formStore` | ✗ | ✓ | ✗ | ✅ |

### Diferencias documentadas

**Branch vs Role:**
- Branch usa `customFields={{ business: BussinesSearchComponent }}` para el campo de relación con Business — documentado en §6
- Branch tiene pantalla de detalle (`[id]/page.tsx`) — Roles no la tiene actualmente
- Branch acepta `BussinesId` opcional en `ListSection` para filtrar por negocio — documentado en §7

**Business vs Role:**
- Business usa `useFormStore` para soportar edición inline (create/edit en mismo SlideOver) — documentado en §5 y §6
- Business tiene pantalla de detalle con `TabsSection` compleja — documentado en §14

Todos los patrones fundamentales son consistentes en las tres pantallas.
