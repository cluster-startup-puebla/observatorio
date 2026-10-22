---
name: admin-screen-polish
description: Pulir pantallas del panel admin (/admin/*) del Observatorio al patrón de directorio ya cerrado (organismos, cuentas, empresas). Usar al barrer contenido (sectores, sesiones, metodología, medios, bandeja, correo) o cuando el usuario diga "aplica el patrón del directorio", "pulir pantalla", "acciones en la tabla", "sheet de alta".
---

# Admin screen polish

Aplica el mismo acabado que el directorio. No inventes otro layout.

## Prompt listo (copiar)

```
Aplica el skill admin-screen-polish a <pantalla(s)>.
Igual que organismos/cuentas/empresas: lista con DataList, alta/edición en FormSheet,
editar/eliminar en RowActions de la tabla (no en el detalle), combobox con búsqueda
para FKs o catálogos largos, labels en español claro, SheetSubmit sin disabled,
errores de usuario (Alert/toast, sin infra), archivos ≤90 líneas.
```

## Checklist por pantalla

1. **Lista** — `*List` client que monta `DataList` + `rowActions` + hijo de alta.
2. **Alta / edición** — `FormSheet` + form POST a `/api/admin/...`. Edición también como `trigger` en la fila.
3. **Borrado** — `DeleteControl` / `AlertDialog` en la fila; confirma antes de POST `accion=eliminar`.
4. **Detalle** — quita botones de editar/eliminar si ya viven en la tabla; el detalle es ficha/tabs, no CRUD primario.
5. **Campos de catálogo** — `SearchCombobox` (o wrapper) si hay muchas opciones o FK; nunca `<select>` vacío + `required`.
6. **Vacío bloqueante** — si falta catálogo/relación, `Alert` + no envíes el form; mensaje accionable.
7. **Labels** — nombre de negocio (“Empresario”, “Sector”), no jerga de esquema (“Perfil”, `profile_id`).
8. **Archivos / color** — `FileDrop` / `LogoField` / `ColorField`; no `type="file"` ni color en texto.
9. **Submit** — `SheetSubmit`; no `disabled` en el botón de envío (rompe el POST nativo).
10. **API** — `requireSuperadmin`, `redirectTo` (Host + 303), reasons de validación en español; errores de infra → mensaje genérico + `console.error`.
11. **Límite** — `.ts`/`.tsx` ≤ 90 líneas; parte pickers, row-actions, list, forms.

## Piezas a reutilizar

| Pieza | Path |
| --- | --- |
| Lista + acciones | `src/components/admin/data-list.tsx`, `row-actions.tsx` |
| Sheet | `form-sheet.tsx`, `sheet-submit.tsx` |
| Combobox | `search-combobox.tsx` (`OrgCombobox` es wrapper) |
| Borrar | `delete-control.tsx`, `AlertDialog` |
| Logo / color / drop | `logo-field.tsx`, `color-field.tsx`, `file-drop.tsx` |
| Redirect / delete API | `src/lib/admin/redirect.ts`, `remove-row.ts` |

## Referencias vivas

- Lista + row actions: `src/app/admin/organismos/`, `empresas/`, `cuentas/`
- Combobox en form: `empresas/empresa-pickers.tsx`, `cuentas/staff-form.tsx`
- Alta sin service role (RPC + sesión): `create-staff.ts` + migración `create_staff_account`

## Fuera de alcance

No rediseñes landing/mesa/onboarding. No metas service role en el cliente. No uses `alert`/`confirm` del navegador.
