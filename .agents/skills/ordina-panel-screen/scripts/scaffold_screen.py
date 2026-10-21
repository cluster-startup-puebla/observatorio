#!/usr/bin/env python3
"""
scaffold_screen.py — Genera el boilerplate para una nueva pantalla en ordina-panel.

Uso:
  python3 scaffold_screen.py <EntityName> [--no-detail] [--with-edit]

Ejemplos:
  python3 scaffold_screen.py Product
  python3 scaffold_screen.py Supplier --with-edit
  python3 scaffold_screen.py AttendanceRule --no-detail

Argumentos:
  EntityName    Nombre en PascalCase (ej: Product, AttendanceRule)
  --no-detail   No generar pantalla de detalle [id]/page.tsx
  --with-edit   Incluir soporte de edición inline (usa formStore)
"""

import sys
import os
import argparse

def camel(s):
    return s[0].lower() + s[1:]

def kebab(s):
    """PascalCase → kebab-case"""
    import re
    return re.sub(r'(?<!^)(?=[A-Z])', '-', s).lower()

def generate(entity: str, no_detail: bool, with_edit: bool, base_path: str):
    e = entity                     # PascalCase:  Product
    ec = camel(entity)             # camelCase:   product
    ek = kebab(entity)             # kebab-case:  attendance-rule
    eu = entity.upper()            # UPPER:       PRODUCT

    files = {}

    # ── GraphQL ──────────────────────────────────────────────────────────────
    files[f"src/graphql/{ec}/{ec}.query.ts"] = f'''\
import {{ gql }} from "@apollo/client";

export const GET_{eu}S = gql`
  query {e}s(
    $where: {e}WhereInput!
    $orderBy: [{e}OrderByInput!]!
    $take: Int
    $skip: Int!
  ) {{
    {ec}s(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {{
      id
      name
      createdAt
    }}
  }}
`;

export const GET_{eu}S_COUNT = gql`
  query Query($where: {e}WhereInput!) {{
    {ec}sCount(where: $where)
  }}
`;

export const SEARCH_{eu}S = gql`
  query {e}s($where: {e}WhereInput!) {{
    {ec}s(where: $where) {{
      name
      id
    }}
  }}
`;
'''

    files[f"src/graphql/{ec}/{ec}.mutation.ts"] = f'''\
import {{ gql }} from "@apollo/client";

export const CREATE_{eu} = gql`
  mutation Create{e}($data: {e}CreateInput!) {{
    create{e}(data: $data) {{
      id
    }}
  }}
`;

export const UPDATE_{eu} = gql`
  mutation Update{e}($where: {e}WhereUniqueInput!, $data: {e}UpdateInput!) {{
    update{e}(where: $where, data: $data) {{
      id
    }}
  }}
`;
'''

    # ── API Routes ────────────────────────────────────────────────────────────
    # create
    files[f"src/app/api/v1/{ec}/create/route.ts"] = f'''\
import {{ auth }} from "auth";
import {{ addNew{e} }} from "./{ec}create.controller";

export const POST = auth(async (req) => {{
  if (!req.auth) {{
    return Response.json({{ message: "Not authenticated" }}, {{ status: 401 }});
  }}

  const data = await req.json();
  const requiredKeys: string[] = ["name"]; // TODO: ajustar campos requeridos
  const dataTransform = await validateRequest(data, requiredKeys);

  try {{
    const saved = await addNew{e}({{ ...dataTransform, email: req.auth?.user?.email }});
    return Response.json({{ data: saved }}, {{ status: 200 }});
  }} catch (error: any) {{
    console.log(`[POST] - CREATE - {e} : ${{error}}`);
    return Response.json({{ error: error.message }}, {{ status: 500 }});
  }}
}});

async function validateRequest(data: any, requiredKeys: string[]) {{
  if (!data || Object.keys(data).length === 0) {{
    return new Response(JSON.stringify({{ error: "JSON data is required" }}), {{ status: 400 }});
  }}
  const missingKeys = requiredKeys.filter((key) => !(key in data));
  if (missingKeys.length > 0) {{
    return new Response(JSON.stringify({{ error: `Missing required keys: ${{missingKeys.join(", ")}}` }}), {{ status: 400 }});
  }}
  return data;
}}
'''

    files[f"src/app/api/v1/{ec}/create/{ec}create.controller.ts"] = f'''\
import create{e} from "./{ec}create.services";

interface {e}CreateData {{
  name: string; // TODO: ajustar campos
}}

export const addNew{e} = async (data: {e}CreateData) => {{
  if (!data) throw new Error("[addNew{e}] - data is required");
  if (!data.name) throw new Error("[addNew{e}] - name is required");

  const saved = await create{e}(data);
  if (!saved) throw new Error("[addNew{e}] - Error creating {e}");
  return saved;
}};
'''

    files[f"src/app/api/v1/{ec}/create/{ec}create.services.ts"] = f'''\
import {{ CREATE_{eu} }} from "@/graphql/{ec}/{ec}.mutation";
import createApolloClient from "@/infrastructure/createApolloClient";

interface {e}CreateInput {{
  name: string; // TODO: ajustar campos
}}

const create{e} = async (data: {e}CreateInput) => {{
  try {{
    const client = createApolloClient();
    const result = await client.mutate({{
      mutation: CREATE_{eu},
      variables: {{
        data: {{
          name: data.name, // TODO: ajustar campos
        }},
      }},
    }});
    return result.data.create{e};
  }} catch (error: any) {{
    console.log("create{e} - service error:", error.message);
    throw error;
  }}
}};

export default create{e};
'''

    # pagination
    files[f"src/app/api/v1/{ec}/pagination/route.ts"] = f'''\
import {{ auth }} from "auth";
import {{ get{e}Pagination }} from "./{ec}pagination.controller";

export const GET = auth(async (req) => {{
  if (!req.auth) {{
    return Response.json({{ message: "Not authenticated" }}, {{ status: 401 }});
  }}
  const {{ searchParams }} = new URL(req.url);
  const page = searchParams.get("page");
  const search = searchParams.get("search") || undefined;

  if (!page) {{
    return Response.json({{ error: "page is required" }}, {{ status: 400 }});
  }}

  try {{
    const result = await get{e}Pagination({{ page: Number(page) || 1, search }});
    return Response.json({{ data: result }}, {{ status: 200 }});
  }} catch (error: any) {{
    console.log(`[GET] - PAGINATION - {e} : ${{error}}`);
    return Response.json({{ error: error.message }}, {{ status: 500 }});
  }}
}});
'''

    files[f"src/app/api/v1/{ec}/pagination/{ec}pagination.controller.ts"] = f'''\
import {{ pagination{e}, getTotalCount{e} }} from "./{ec}pagination.services";

interface PaginationParams {{
  page: number;
  search?: string;
}}

export const get{e}Pagination = async (params: PaginationParams) => {{
  const [{ec}List, totalRow] = await Promise.all([
    pagination{e}(params),
    getTotalCount{e}(params.search),
  ]);
  return {{ {ec}List, totalRow }};
}};
'''

    files[f"src/app/api/v1/{ec}/pagination/{ec}pagination.services.ts"] = f'''\
import {{ GET_{eu}S, GET_{eu}S_COUNT }} from "@/graphql/{ec}/{ec}.query";
import createApolloClient from "@/infrastructure/createApolloClient";

interface PaginationData {{
  page: number;
  search?: string;
}}

export const pagination{e} = async (data: PaginationData) => {{
  try {{
    const client = createApolloClient();
    const result = await client.query({{
      query: GET_{eu}S,
      variables: {{
        where: {{
          deleted: {{ equals: false }},
          ...(data.search
            ? {{ OR: [{{ name: {{ contains: data.search }} }}] }}
            : {{}}),
        }},
        take: 10,
        skip: (data.page - 1) * 10,
        orderBy: [{{ createdAt: "desc" }}],
      }},
    }});
    return result.data.{ec}s || [];
  }} catch (error: any) {{
    console.log("pagination{e} error:", error.message);
    throw error;
  }}
}};

export const getTotalCount{e} = async (search?: string): Promise<number> => {{
  try {{
    const client = createApolloClient();
    const result = await client.query({{
      query: GET_{eu}S_COUNT,
      variables: {{
        where: {{
          deleted: {{ equals: false }},
          ...(search ? {{ OR: [{{ name: {{ contains: search }} }}] }} : {{}}),
        }},
      }},
    }});
    return result.data.{ec}sCount || 0;
  }} catch (error: any) {{
    console.log("getTotalCount{e} error:", error.message);
    throw error;
  }}
}};
'''

    # softDelete
    files[f"src/app/api/v1/{ec}/softDelete/route.ts"] = f'''\
import {{ auth }} from "auth";
import {{ softDelete{e} }} from "./{ec}softDelete.controller";

export const PUT = auth(async (req) => {{
  if (!req.auth) {{
    return Response.json({{ message: "Not authenticated" }}, {{ status: 401 }});
  }}
  const data = await req.json();

  try {{
    const deleted = await softDelete{e}({{ id: data.id, email: req.auth?.user?.email }});
    return Response.json({{ data: deleted }}, {{ status: 200 }});
  }} catch (error: any) {{
    return Response.json({{ error: error.message }}, {{ status: 500 }});
  }}
}});
'''

    files[f"src/app/api/v1/{ec}/softDelete/{ec}softDelete.controller.ts"] = f'''\
import softDelete{e}Service from "./{ec}softDelete.services";

export const softDelete{e} = async (data: {{ id: string; email?: string }}) => {{
  if (!data.id) throw new Error("[softDelete{e}] - id is required");
  return await softDelete{e}Service(data);
}};
'''

    files[f"src/app/api/v1/{ec}/softDelete/{ec}softDelete.services.ts"] = f'''\
import {{ UPDATE_{eu} }} from "@/graphql/{ec}/{ec}.mutation";
import createApolloClient from "@/infrastructure/createApolloClient";
import {{ getGraphqlError }} from "@/infrastructure/getGraphqlError";

const softDelete{e}Service = async (data: {{ id: string }}) => {{
  try {{
    const client = createApolloClient();
    const {{ data: result }} = await client.mutate({{
      mutation: UPDATE_{eu},
      variables: {{
        where: {{ id: data.id }},
        data: {{ deleted: true }},
      }},
    }});
    return result.update{e};
  }} catch (error: any) {{
    const message = getGraphqlError(error);
    console.log("softDelete{e} error:", message);
    return null;
  }}
}};

export default softDelete{e}Service;
'''

    # ── Client Services ───────────────────────────────────────────────────────
    files[f"src/services/client/{ec}/create/index.ts"] = f'''\
import coreInstances from "@/config/coreInstances";

export const addNew{e}Client = async (data: any) => {{
  try {{
    const saved = await coreInstances.post(`/{ec}/create`, data);
    return saved.data;
  }} catch (error) {{
    console.error("[addNew{e}Client] - Error creating {e}", error);
    return null;
  }}
}};
'''

    files[f"src/services/client/{ec}/pagination/index.ts"] = f'''\
import coreInstances from "@/config/coreInstances";

export const get{e}Client = async (
  currentPage: number,
  search?: string
): Promise<{{ {ec}List: any[]; totalRow: number }} | null> => {{
  try {{
    const result = await coreInstances.get(`/{ec}/pagination`, {{
      params: {{ page: currentPage, ...(search && {{ search }}) }},
    }});
    return result.data.data;
  }} catch (error) {{
    console.error("[get{e}Client] - Error getting {e}s", error);
    return null;
  }}
}};
'''

    files[f"src/services/client/{ec}/softDelete/index.ts"] = f'''\
import coreInstances from "@/config/coreInstances";

export const softRemove{e}Client = async ({{ id }}: {{ id: string }}) => {{
  try {{
    const result = await coreInstances.put(`/{ec}/softDelete`, {{ id }});
    return result.data.data;
  }} catch (error) {{
    console.error("[softRemove{e}Client] - Error deleting {e}", error);
    return null;
  }}
}};
'''

    # ── Table ─────────────────────────────────────────────────────────────────
    files[f"src/table/{e}Table/get{e}Columns.tsx"] = f'''\
import {{ ColumnDef }} from "@tanstack/react-table";
import dayjs from "dayjs";
import {e}ActionButton from "./{e}ActionButton";

export const get{e}Columns = (): ColumnDef<any>[] => [
  {{
    header: "Nombre",
    accessorKey: "name",
    enableSorting: false,
    cell: (info) => info.row.original.name || "-",
  }},
  // TODO: agregar más columnas según el modelo
  {{
    header: "Creado",
    accessorKey: "createdAt",
    enableSorting: false,
    cell: (info) => {{
      const date = info.row.original.createdAt;
      return date ? dayjs(date).format("DD/MM/YYYY") : "-";
    }},
  }},
  {{
    header: "Acciones",
    cell: ({{ row }}) => <{e}ActionButton id={{row.original.id}} data={{row.original}} />,
  }},
];
'''

    files[f"src/table/{e}Table/{e}ActionButton.tsx"] = f'''\
"use client";
import React, {{ useRef, useState }} from "react";
import {{ Trash2 }} from "lucide-react";
import Modal, {{ ModalRef }} from "@/components/modals/Modal";
import DeleteModal from "@/components/modals/DeleteModal";
import {{ softRemove{e}Client }} from "@/services/client/{ec}/softDelete";
import toast from "react-hot-toast";
import {{ useRouter }} from "next/navigation";
import useRefreshStore from "@/store/refreshStore";
// import {{ DetailButton }} from "@/components/actionButton/detailButton"; // Descomentar si hay pantalla de detalle

interface {e}ActionButtonProps {{
  id: string;
  data: any;
}}

export default function {e}ActionButton({{ id, data }}: {e}ActionButtonProps) {{
  const modalRef = useRef<ModalRef>(null);
  const [loading, setLoading] = useState(false);
  const {{ needRefresh }} = useRefreshStore();
  const router = useRouter();

  const handleDelete = async () => {{
    setLoading(true);
    const deleted = await softRemove{e}Client({{ id }});
    setLoading(false);

    if (deleted) {{
      toast.success("{e} eliminado con éxito", {{ icon: "🗑️", duration: 5000 }});
      router.refresh();
      needRefresh();
      modalRef.current?.hide();
      return true;
    }} else {{
      toast.error("Error al eliminar, inténtalo de nuevo", {{ icon: "⚠️" }});
      return false;
    }}
  }};

  return (
    <div className="flex gap-2">
      {{/* <DetailButton href={{`/dashboard/{ek}/${{id}}`}} showIcon={{true}} /> */}}
      <button
        onClick={{() => modalRef.current?.show()}}
        className="inline-block text-white border border-red-500 bg-red-500 font-medium rounded-lg text-xs px-3 py-2.5 me-1 mb-2 mr-2"
        title="Eliminar"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <Modal ref={{modalRef}} title="Confirmar Eliminación">
        <DeleteModal
          onCancel={{() => modalRef.current?.hide()}}
          onConfirm={{handleDelete}}
          loading={{loading}}
          entityName="{e}"
        />
      </Modal>
    </div>
  );
}}
'''

    files[f"src/table/{e}Table/All{e}Table.tsx"] = f'''\
"use client";
import React from "react";
import DataTable from "../DataTable";
import {{ get{e}Client }} from "@/services/client/{ec}/pagination";
import {{ get{e}Columns }} from "./get{e}Columns";

interface All{e}TableProps {{
  data: any[];
  totalRow: number;
}}

function All{e}Table({{ data = [], totalRow }}: All{e}TableProps) {{
  const columns = get{e}Columns();

  const getResultsPerPage = async (pageNumber: number, searchValue?: string) => {{
    const result = await get{e}Client(pageNumber, searchValue);
    return result?.{ec}List || [];
  }};

  const getResultCount = async (searchValue?: string): Promise<number> => {{
    const result = await get{e}Client(1, searchValue);
    return result?.totalRow || 0;
  }};

  return (
    <DataTable
      data={{data}}
      columns={{columns}}
      dataTotalCount={{totalRow}}
      handlerChangeTableData={{getResultsPerPage}}
      handlerChangeDataCount={{getResultCount}}
      externalSearch={{true}}
    />
  );
}}

export default All{e}Table;
'''

    # ── Section ───────────────────────────────────────────────────────────────
    files[f"src/section/{e}ListSection.tsx"] = f'''\
"use client";
import {{ ListEmpty }} from "./ListEmpty";
import useRefreshStore from "@/store/refreshStore";
import {{ useState, useEffect }} from "react";
import {{ ListLoader }} from "./ListLoader";
import {{ get{e}Client }} from "@/services/client/{ec}/pagination";
import All{e}Table from "@/table/{e}Table/All{e}Table";

export default function {e}ListSection() {{
  const {{ refresh, refreshed }} = useRefreshStore();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [totalRow, setTotalRow] = useState(0);

  useEffect(() => {{
    const fetchItems = async () => {{
      setLoading(true);
      try {{
        const result = await get{e}Client(1);
        setItems(result?.{ec}List || []);
        setTotalRow(result?.totalRow || 0);
      }} catch (error) {{
        console.error("[get{e}Client] - Error getting {ec}s", error);
      }} finally {{
        setLoading(false);
        refreshed();
      }}
    }};
    fetchItems();
  }}, [refresh]);

  if (loading) return <ListLoader size="large" />;

  if (!loading && items.length === 0) {{
    return (
      <ListEmpty
        icon="ic:round-list"  // TODO: ajustar icono Iconify
        size="large"
        complementText="Empieza creando un {ec}"
      />
    );
  }}

  return (
    <section className="my-5">
      <All{e}Table data={{items}} totalRow={{totalRow}} />
    </section>
  );
}}
'''

    # ── Dashboard Page ────────────────────────────────────────────────────────
    files[f"src/app/dashboard/{ek}/page.tsx"] = f'''\
import React from "react";
import {{ Suspense }} from "react";
import {{ Metadata }} from "next";
import {{ APP_NAME, APP_TAGLINE }} from "@/config";
import Header{e}Page from "./components/Header{e}Page";
import getFormData from "@/services/server/forms/getFormData";
import {{ ListLoader }} from "@/section/ListLoader";
import {e}ListSection from "@/section/{e}ListSection";

export const metadata: Metadata = {{
  title: `${{APP_NAME}} | {e} | ${{APP_TAGLINE}}`,
  description: "Gestión de {ec}s.", // TODO: ajustar descripción
}};

export default async function {e}Page() {{
  const formData = await getFormData({{ key: "{e}" }}); // TODO: verificar key en Keystone

  return (
    <section className="space-y-6">
      <Header{e}Page
        title={{formData?.label || "Lista de {ec}s"}}
        links={{links{e}Page}}
        formData={{formData}}
        textbutton={{`Nuevo ${{formData?.label}}`}}
      />
      <Suspense fallback={{<ListLoader size="large" />}}>
        <{e}ListSection />
      </Suspense>
    </section>
  );
}}

const links{e}Page = [
  {{ name: "{e}", href: "/dashboard/{ek}" }},
];
'''

    files[f"src/app/dashboard/{ek}/components/Header{e}Page.tsx"] = f'''\
"use client";
import React, {{ Suspense }} from "react";
import HeaderDashboard from "@/components/dashboard/HeaderDashboard";
import SlideOver from "@/components/sideOver/slideOver";
import {e}FormWrapper from "./{e}FormWrapper";
import {{ useSlideOver }} from "@/app/dashboard/bussines/hooks/useBusinessHooks";
import {{ use{e}Submit }} from "../hooks/use{e}Hooks";

export default function Header{e}Page({{ title, links, formData, textbutton }}: any) {{
  const {{ slideOverRef, openSlideOver, closeSlideOver }} = useSlideOver();
  const {{ handle{e}Submit }} = use{e}Submit(closeSlideOver);

  return (
    <>
      <HeaderDashboard
        text={{title}}
        links={{links}}
        activedbutton={{true}}
        textbutton={{textbutton}}
        iconbutton="ic:round-list"  // TODO: ajustar icono Iconify
        action={{openSlideOver}}
      />
      <SlideOver ref={{slideOverRef}} title="Nuevo {e}">
        <Suspense fallback={{<div>Cargando formulario...</div>}}>
          {{formData ? (
            <{e}FormWrapper formData={{formData}} onSubmit={{handle{e}Submit}} />
          ) : (
            <div>Error al cargar los metadatos del formulario</div>
          )}}
        </Suspense>
      </SlideOver>
    </>
  );
}}
'''

    files[f"src/app/dashboard/{ek}/components/{e}FormWrapper.tsx"] = f'''\
"use client";
import {{ DynamicForm }} from "@/components/dynamicForm/DynamicForm";
import {{ AdminList }} from "@/services/server/forms/getFormData";

type Props = {{
  formData: AdminList;
  onSubmit: (data: any) => void;
}};

export default function {e}FormWrapper({{ formData, onSubmit }}: Props) {{
  return (
    <DynamicForm
      adminList={{formData}}
      onSubmit={{onSubmit}}
      overrides={{{{
        hide: [
          "id",
          "createdAt",
          "updatedAt",
          "deleted",
          // TODO: agregar relaciones hasMany a ocultar
        ],
      }}}}
      // customFields={{{{  }}}}  // TODO: agregar si hay campos de relación FK
    />
  );
}}
'''

    files[f"src/app/dashboard/{ek}/hooks/use{e}Hooks.ts"] = f'''\
import {{ useRouter }} from "next/navigation";
import toast from "react-hot-toast";
import useRefreshStore from "@/store/refreshStore";
import {{ addNew{e}Client }} from "@/services/client/{ec}/create";

export const use{e}Submit = (closeSlideOver: () => void) => {{
  const router = useRouter();
  const {{ needRefresh }} = useRefreshStore();

  const handle{e}Submit = async (data: any): Promise<boolean> => {{
    const loadingToast = toast.loading("Guardando...");
    try {{
      const saved = await addNew{e}Client(data);
      if (!saved) throw new Error("No se recibió confirmación del servidor");

      toast.dismiss(loadingToast);
      toast.success("{e} creado con éxito", {{ icon: "✅", duration: 5000 }});
      closeSlideOver();
      router.refresh();
      needRefresh();
      return true;
    }} catch (error: any) {{
      toast.dismiss(loadingToast);
      toast.error("Error al crear, inténtalo de nuevo", {{ icon: "⚠️" }});
      return false;
    }}
  }};

  return {{ handle{e}Submit }};
}};
'''

    # ── Detail Page (optional) ────────────────────────────────────────────────
    if not no_detail:
        files[f"src/app/dashboard/{ek}/[id]/page.tsx"] = f'''\
import HeaderDashboard from "@/components/dashboard/HeaderDashboard";
import {{ ListLoader }} from "@/section/ListLoader";
import React, {{ Suspense }} from "react";
// import Header{e}DetailPage from "../components/detail/Header{e}DetailPage";

export const dynamic = "force-dynamic";

export default function {e}DetailPage({{ params }}: {{ params: {{ id: string }} }}) {{
  const {{ id }} = params;
  return (
    <section>
      <HeaderDashboard
        text="Detalles de {ec}"
        links={{links{e}Detail(id)}}
        activedbutton={{false}}
        textbutton=""
        iconbutton=""
        detailInfo={{`${{id}}`}}
      />
      <Suspense fallback={{<ListLoader size="large" />}}>
        <section className="rounded-2xl my-10">
          {{/* <Header{e}DetailPage {e}Id={{id}} /> */}}
          {{/* <{e}TabSection {e}Id={{id}} /> */}}
          <div className="p-4 text-gray-500">TODO: Implementar detalle de {ec}</div>
        </section>
      </Suspense>
    </section>
  );
}}

const links{e}Detail = (id: string) => [
  {{ name: "{e}", href: "/dashboard/{ek}" }},
  {{ name: "Detalle", href: `/dashboard/{ek}/${{id}}` }},
];
'''

    # ── Write files ───────────────────────────────────────────────────────────
    created = []
    skipped = []
    for rel_path, content in files.items():
        full_path = os.path.join(base_path, rel_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        if os.path.exists(full_path):
            skipped.append(rel_path)
            continue
        with open(full_path, "w") as f:
            f.write(content)
        created.append(rel_path)

    print(f"\n✅ Scaffold generado para entidad: {entity}\n")
    print(f"📁 Archivos creados ({len(created)}):")
    for f in created:
        print(f"   + {f}")
    if skipped:
        print(f"\n⚠️  Archivos omitidos (ya existen) ({len(skipped)}):")
        for f in skipped:
            print(f"   ~ {f}")

    print("\n📝 TODOs pendientes:")
    print(f"   1. Verificar que la key de Keystone sea '{entity}' en page.tsx")
    print(f"   2. Ajustar campos en GraphQL queries/mutations según el modelo")
    print(f"   3. Ajustar campos en overrides.hide del FormWrapper")
    print(f"   4. Ajustar columnas de la tabla en get{entity}Columns.tsx")
    print(f"   5. Agregar la ruta /dashboard/{ek} en la navegación del sidebar")
    if not no_detail:
        print(f"   6. Implementar Header{entity}DetailPage y TabSection en el detalle")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scaffold a new ordina-panel screen")
    parser.add_argument("entity", help="Entity name in PascalCase (e.g. Product, AttendanceRule)")
    parser.add_argument("--no-detail", action="store_true", help="Skip detail page generation")
    parser.add_argument("--with-edit", action="store_true", help="Include formStore edit support (Business pattern)")
    parser.add_argument(
        "--base-path",
        default=os.path.join(os.path.dirname(__file__), "../../../../"),
        help="Base path of ordina-panel (default: project root)"
    )
    args = parser.parse_args()

    generate(
        entity=args.entity,
        no_detail=args.no_detail,
        with_edit=args.with_edit,
        base_path=os.path.abspath(args.base_path),
    )
