#!/usr/bin/env python3
"""
scaffold_detail.py — Genera el boilerplate para una pantalla de detalle en ordina-panel.

Uso:
  python3 scaffold_detail.py <EntityName> [--no-tabs] [--id-field <campo>]

Ejemplos:
  python3 scaffold_detail.py Branch
  python3 scaffold_detail.py ShiftPlan --no-tabs
  python3 scaffold_detail.py Employee --id-field CURP

Argumentos:
  EntityName          Nombre en PascalCase (ej: Branch, ShiftPlan)
  --no-tabs           No generar TabSection (variante B: solo header con Cards)
  --id-field FIELD    Nombre del parámetro de URL (default: id)
"""

import sys, os, argparse, re

def camel(s):   return s[0].lower() + s[1:]
def kebab(s):   return re.sub(r'(?<!^)(?=[A-Z])', '-', s).lower()
def upper(s):   return re.sub(r'(?<!^)(?=[A-Z])', '_', s).upper()

def generate(entity: str, no_tabs: bool, id_field: str, base_path: str):
    e   = entity
    ec  = camel(entity)
    ek  = kebab(entity)
    eu  = upper(entity)
    idf = id_field  # "id" o "CURP" etc.

    files = {}

    # ── GraphQL singular query ────────────────────────────────────────────────
    files[f"src/graphql/{ec}/{ec}.detail.query.ts"] = f'''\
import {{ gql }} from "@apollo/client";

// Query singular para la pantalla de detalle — más campos que la query de lista
export const GET_{eu} = gql`
  query {e}($where: {e}WhereUniqueInput!) {{
    {ec}(where: $where) {{
      id
      name
      description
      createdAt
      // TODO: agregar relaciones padre con id, name, photo {{ url }}
      // TODO: agregar *Count de relaciones hijas para estadísticas
    }}
  }}
`;
'''

    # ── Server-side service ───────────────────────────────────────────────────
    files[f"src/services/server/{e}/get{e}Detail.ts"] = f'''\
import {{ GET_{eu} }} from "@/graphql/{ec}/{ec}.detail.query";
import createApolloClient from "@/infrastructure/createApolloClient";
import {{ getGraphqlError }} from "@/infrastructure/getGraphqlError";

export const get{e}Detail = async ({idf}: string) => {{
  if (!{idf}) throw new Error("{e} {idf} is required");

  try {{
    const client = createApolloClient();
    const {{ data: {{ {ec} }} }} = await client.query({{
      query: GET_{eu},
      variables: {{ where: {{ {idf}: {idf} }} }},
    }});
    return {ec};
  }} catch (error) {{
    const message = getGraphqlError(error);
    console.log("GET {eu} ERROR: ", message);
    return null;
  }}
}};
'''

    # ── Detail Page ───────────────────────────────────────────────────────────
    param_name = idf  # "id" o "CURP"
    files[f"src/app/dashboard/{ek}/[{param_name}]/page.tsx"] = f'''\
import HeaderDashboard from "@/components/dashboard/HeaderDashboard";
import {{ ListLoader }} from "@/section/ListLoader";
import React, {{ Suspense }} from "react";
import Header{e}DetailPage from "../components/detail/Header{e}DetailPage";
{"import " + e + "TabSection from \"../components/detail/" + e + "TabSection\";" if not no_tabs else "// No TabSection — variante solo-header"}

export const dynamic = "force-dynamic"; // ← Obligatorio: evita caché de Next.js

export default function {e}DetailPage({{
  params,
}}: {{
  params: {{ {param_name}: string }};
}}) {{
  const {{ {param_name} }} = params;

  return (
    <section>
      <HeaderDashboard
        text="Detalles de {ec}"
        links={{links{e}Detail({param_name})}}
        activedbutton={{false}}
        textbutton=""
        iconbutton=""
        detailInfo={{`${{{param_name}}}`}}
      />
      <Suspense fallback={{<ListLoader size="large" />}}>
        <section className="rounded-2xl my-10">
          <Header{e}DetailPage {e}{param_name.capitalize()}={{{param_name}}} />
          {"<" + e + "TabSection " + e + param_name.capitalize() + "={" + param_name + "} />" if not no_tabs else ""}
        </section>
      </Suspense>
    </section>
  );
}}

const links{e}Detail = ({param_name}: string) => [
  {{ name: "{e}", href: "/dashboard/{ek}" }},
  {{ name: "Detalle", href: `/dashboard/{ek}/${{{param_name}}}` }},
];
'''

    # ── Header Detail Page ────────────────────────────────────────────────────
    files[f"src/app/dashboard/{ek}/components/detail/Header{e}DetailPage.tsx"] = f'''\
// Sin "use client" — async Server Component
import {{ get{e}Detail }} from "@/services/server/{e}/get{e}Detail";
import {{ Card, CardContent, CardHeader, CardTitle }} from "@/components/ui/card";
import {{ Avatar, AvatarFallback, AvatarImage }} from "@/components/ui/avatar";
import {{ AlertCircle, MapPin, Phone, Mail, Calendar }} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

// Helper: iniciales para Avatar fallback
const getInitials = (name: string) =>
  name?.split(" ").map((w) => w.charAt(0)).join("").toUpperCase().slice(0, 2);

// Helper: fecha en español
const formatDate = (date: string) =>
  dayjs(date).format("DD [de] MMMM [de] YYYY");

export default async function Header{e}DetailPage({{
  {e}{param_name.capitalize()},
}}: {{
  {e}{param_name.capitalize()}: string;
}}) {{
  const {ec} = await get{e}Detail({e}{param_name.capitalize()});

  // Estado de error — siempre primero
  if (!{ec}) {{
    return (
      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="mx-auto h-12 w-12 mb-2" />
            <p>No se pudo cargar la información de {ec}</p>
          </div>
        </CardContent>
      </Card>
    );
  }}

  return (
    <Card className="bg-white border border-border shadow-sm mb-6">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

          {{/* Sección izquierda: Avatar + nombre + descripción + badges de padre */}}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Avatar className="h-20 w-20 border-2 border-gray-200 flex-shrink-0">
              <AvatarImage src={{""}} alt={{{ec}.name || "{e}"}} className="object-cover" />
              <AvatarFallback className="bg-gray-100 text-gray-600 text-lg font-semibold">
                {{getInitials({ec}.name || "{e}")}}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">
                {{{ec}.name || "Sin nombre"}}
              </CardTitle>
              <p className="text-gray-600 text-sm leading-relaxed break-words">
                {{{ec}.description || "Sin descripción disponible"}}
              </p>
              {{/* TODO: Badge de entidad padre
              {{parent && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 mt-2">
                  <Building2 className="h-3 w-3 mr-1" />
                  <Link href={{`/dashboard/parent/${{parent.id}}`}}>{{parent.name}}</Link>
                </Badge>
              )}} */}}
            </div>
          </div>

          {{/* Sección derecha: contadores / estadísticas */}}
          {{/* TODO: agregar contadores
          <div className="flex gap-4 lg:flex-shrink-0">
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                <Users className="h-6 w-6 mx-auto text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{{count}}</div>
              <div className="text-xs text-gray-500">Label</div>
            </div>
          </div>
          */}}
        </div>
      </CardHeader>

      <CardContent className="pt-3">
        {{/* Grid de campos de información — condicional si el campo existe */}}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {{{ec}.createdAt && (
            <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <Calendar className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Creado</div>
                <div className="text-sm font-medium text-gray-900">
                  {{formatDate({ec}.createdAt)}}
                </div>
              </div>
            </div>
          )}}
          {{/* TODO: agregar más campos con el mismo patrón:
          {{field && (
            <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <Icon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Label</div>
                <div className="text-sm font-medium text-gray-900 break-words">{{field}}</div>
              </div>
            </div>
          )}}
          */}}
        </div>
      </CardContent>
    </Card>
  );
}}
'''

    # ── TabSection (opcional) ─────────────────────────────────────────────────
    if not no_tabs:
        files[f"src/app/dashboard/{ek}/components/detail/{e}TabSection.tsx"] = f'''\
// Sin "use client" — Server Component
import {{ ITabsProps }} from "@/components/tabs/tabs";
import {{ TabsSection }} from "@/components/tabs/TabsSection";
// TODO: importar los ListSection que apliquen
// import RelatedListSection from "@/section/RelatedListSection";

export default function {e}TabSection({{ {e}{param_name.capitalize()} }}: {{ {e}{param_name.capitalize()}: string }}) {{
  const tabs: ITabsProps[] = [
    // TODO: agregar tabs según las relaciones de la entidad
    // {{
    //   name: "Relacionados",          // Texto del tab
    //   value: "related",              // ?tab=related en la URL (kebab-case, sin espacios)
    //   visible: true,
    //   count: 0,                      // 0 = no muestra badge
    //   component: <RelatedListSection {ec}Id={{{e}{param_name.capitalize()}}} />,
    // }},
  ];

  return <TabsSection TabsContent={{tabs}} />;
}}
'''

    # ── Write files ───────────────────────────────────────────────────────────
    created, skipped = [], []
    for rel_path, content in files.items():
        full_path = os.path.join(base_path, rel_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        if os.path.exists(full_path):
            skipped.append(rel_path)
            continue
        with open(full_path, "w") as f:
            f.write(content)
        created.append(rel_path)

    print(f"\n✅ Detail scaffold generado para: {entity}\n")
    print(f"📁 Archivos creados ({len(created)}):")
    for f in created:
        print(f"   + {f}")
    if skipped:
        print(f"\n⚠️  Omitidos (ya existen) ({len(skipped)}):")
        for f in skipped:
            print(f"   ~ {f}")

    print("\n📝 TODOs pendientes:")
    print(f"   1. Agregar campos al GET_{eu} en {ec}.detail.query.ts")
    print(f"   2. Ajustar el `where` en get{e}Detail.ts si el campo único no es `{idf}`")
    print(f"   3. Completar el Header: Avatar photo, contadores, campos de info")
    print(f"   4. Agregar Badge con Link si hay entidad padre")
    if not no_tabs:
        print(f"   5. Agregar tabs en {e}TabSection con los ListSection relacionados")
    print(f"   6. Habilitar DetailButton en [e]ActionButton.tsx (descomentar)")
    print(f"   7. Agregar GET_{eu} a src/graphql/{ec}/{ec}.query.ts (o mantener en .detail.query.ts)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("entity", help="Entity name in PascalCase")
    parser.add_argument("--no-tabs", action="store_true", help="Skip TabSection (variant B)")
    parser.add_argument("--id-field", default="id", help="URL param name (default: id)")
    parser.add_argument(
        "--base-path",
        default=os.path.join(os.path.dirname(__file__), "../../../../"),
        help="Base path of ordina-panel"
    )
    args = parser.parse_args()
    generate(args.entity, args.no_tabs, args.id_field, os.path.abspath(args.base_path))
