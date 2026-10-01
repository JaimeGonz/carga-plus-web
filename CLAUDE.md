@AGENTS.md

# Carga+ (Frontend) — Contexto para Claude Code

App de seguimiento de entrenamiento (gym tracker), construida como proyecto de
portafolio para búsqueda de empleo remoto full-stack. Dueño: Jaime González (Valdo).

Repo hermano: `CargaPlus` (backend NestJS) — tiene su propio CLAUDE.md.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind + shadcn/ui (preset Nova, base Radix)

- TanStack Query + React Hook Form + Zod (para formularios complejos, no aún usado en
  login/registro que son formularios simples con useState).

Fuentes: Bebas Neue (`font-heading`, títulos/números grandes) + Inter (`font-sans`,
cuerpo). Ambas vía `next/font/google`.

Tema: dark-mode-first con toggle a claro (`next-themes`, `defaultTheme="dark"`,
`enableSystem={false}` — la elección del usuario nunca la debe pisar la del SO).

## Paleta de colores

- `--primary`: verde lima eléctrico — reservado para acciones (botones, links activos,
  datos que importa que el ojo capture). Nunca usarlo en elementos decorativos.
- `--gold`: dorado — reservado exclusivamente para features Pro/premium (todavía no
  construidas). No mezclar con `--primary`.
- Regla 60-30-10: negro/gris dominante, acento solo en el 10% que importa.

## Arquitectura de autenticación — la decisión más importante del proyecto

JWT en **cookie httpOnly**, nunca en localStorage (XSS). Como el backend (Railway) y
el frontend (Vercel) viven en dominios distintos, una cookie httpOnly no viaja sola
entre ellos — por eso:

- El navegador **nunca** llama directo a la API de NestJS.
- Llama a Route Handlers internos (`app/api/...`), mismo dominio, ahí la cookie sí
  viaja automáticamente.
- Esos Route Handlers (server-side) leen la cookie con `request.cookies.get(...)` y
  reenvían la petición real al backend vía `lib/backend.ts` (`backendFetch`), con el
  token en `Authorization: Bearer <token>`.
- Login/registro/logout son la excepción — crean/borran la cookie, no la leen. No
  deben pasar por el helper genérico de proxy.

`src/proxy.ts` (⚠️ Next.js 16 renombró `middleware.ts` → `proxy.ts`, y la función
exportada de `middleware` → `proxy`; corre en runtime Node, no Edge). Protege rutas
por default (todo excepto `PUBLIC_PATHS` explícitos) — nunca por lista de rutas a
proteger, para que rutas nuevas queden protegidas sin acordarse de agregarlas.

Refresh token (access + refresh) planeado, no implementado todavía — ver
`docs/ideas-v2.md`, sección "Refresh token".

## Patrón para cualquier feature nueva

Siempre en este orden, 4 piezas:

1. `lib/types/<recurso>.ts` — tipos, extraídos como `type` con nombre si son enums
   reutilizados en más de un lugar (nunca `string` genérico para un enum del backend).
2. `app/api/<recurso>/route.ts` (y `[id]/route.ts` si aplica) — Route Handler proxy.
3. `lib/api/<recurso>.ts` — cliente que el frontend llama (`fetch("/api/...")`, nunca
   al backend directo).
4. `app/(protected)/<recurso>/page.tsx` — la pantalla, con `useQuery`/`useMutation`.

Helpers `lib/api-proxy.ts` y `lib/api-fetch.ts` existen (creados para reducir
duplicación de las piezas 2 y 3) pero **deliberadamente no están conectados
todavía** — decisión pedagógica de Valdo, escribir el patrón a mano hasta que sea
automático antes de abstraerlo. No migrar código existente a ellos sin que él lo pida.

## Convenciones de código

- Archivos: kebab-case. Componentes exportados: PascalCase.
- `function nombre() {}` para utilidades/componentes exportados; flechas inline solo
  para callbacks cortos (`onChange={(e) => ...}`).
- Nunca `??` para decidir si un valor numérico ya convertido está "vacío" — comparar
  el string original _antes_ de `Number(...)`, porque `Number("") = 0` y `0 ?? null`
  no cae en el fallback (0 no es null/undefined).
- IDs de fila en listas dinámicas: nunca asumir que la posición del array (`arr[i]`)
  coincide con un campo de negocio como `order` — siempre `.find(x => x.order === i + 1)`.
  Causó bugs reales dos veces en `ExerciseTracker`.
- Mutaciones con `useMutation`: siempre desestructurar `error`, nunca dejarlo fallar
  en silencio. Mostrar con `<Alert variant="destructive">` (persistente) o
  `toast.error()` (`sonner`, transitorio) según si el error bloquea la pantalla o no.
- Unidades de viewport en mobile: usar `dvh`, no `vh` (barra de navegadores móviles
  rompe `vh` — causó bug real de contenido cortado en el portafolio, mismo riesgo
  aquí).
- Commits: Conventional Commits (`feat`/`fix`/`chore`/`refactor`), atómicos — un
  cambio lógico por commit, nunca mezclar features con housekeeping.

## Estado actual del proyecto (actualizado 23 sept 2026)

**Completo:**

- Setup (Next.js, shadcn Nova, paleta, fuentes, ThemeProvider/Toggle).
- Auth completa: registro, login, logout, proxy de rutas protegidas, cookie httpOnly,
  manejo de errores con `Alert` en todos los formularios.
- Rutinas: listado + detalle, rediseñados para coincidir con patrones de Hevy
  (nombres reales de ejercicios vía catálogo, tabla zebra-striped, jerarquía
  tipográfica). `GET /routines` no trae ejercicios anidados; `GET /routines/:id` sí.
- Sesión de entrenamiento: iniciar (`POST /workout-sessions`), registrar sets con
  pre-llenado de "previous values" (posición por posición, no "el último set"),
  patrón crear+confirmar de dos pasos, marcar/desmarcar con sincronización correcta,
  finalizar sesión, animación de pulso CSS al confirmar un set, toasts de
  confirmación (`sonner`) para eventos poco frecuentes, `Alert` para errores.
- Bugs de backend reales resueltos: condición de carrera en `order` al crear sets
  simultáneos (fix: `@@unique([sessionId, exerciseId, order])` + reintento en
  `P2002`), "previous values" contaminándose con la sesión actual aún sin terminar
  (fix: filtrar `isCompleted: true`).
- Pulido UX de la tabla de sets (23 sept): fix de recorte de dígitos (quitar Card,
  `table-fixed`), columna SERIE centrada, texto plano en filas confirmadas (no
  input deshabilitado), check más grande y con estado visual distinto
  confirmado/pendiente, placeholder tenue vs. valor editado, botón "Agregar Serie"
  con más peso visual + "Deshacer" para el caso de clic accidental.

**En progreso ahora mismo (23 sept):**

- Selector de tipo de serie (W/Normal/F/Drop/Eliminar) — requiere agregar `setType`
  a `CreateWorkoutSetDto` en el backend (no está hoy) + wirear el `DELETE` de un set
  desde el frontend (endpoint de backend ya existe, sin conectar).
- Selector de RIR interactivo con `Slider` de shadcn (0-5, paso 1, con descripción
  educativa por valor) — reemplaza el `<Input type="number">` actual de RIR.
- Ambos usan un wrapper responsivo: `Drawer` (shadcn, sobre `vaul`) en mobile,
  `Popover` en desktop — mismo `vaul` que se reutilizará para la feature de sesión
  minimizable (ver `docs/ideas-v2.md`).

**Pendiente, no empezado:**

- Formulario de crear rutina con ejercicios anidados (`useFieldArray` de React Hook
  Form, primera vez real usando esta librería — login/registro usaron `useState`
  manual). Decisión sin resolver: ¿de dónde viene el `programId`?
- Dashboard (Recharts, aún no tocado).
- Deploy final + revisión responsive general del bloque de Rutinas/Sesión.

## Documentos de referencia — consultar cuándo

- `docs/roadmap.html` — plan completo de fases, abrir en navegador (app interactiva
  con checkboxes, no leer como texto plano). Consultar para saber qué sigue después
  del bloque actual.
- `docs/ideas-v2.md` — **todo lo que se decidió posponer, con la razón.** Consultar
  **antes** de sugerir cualquier feature "nueva" (WebSockets, IA, Supabase, sesión
  minimizable, helpers de reducción de código, etc.) — muy probablemente ya se
  evaluó y quedó anotada aquí con su razón de posponerse. No proponerla como si
  fuera idea nueva sin haber revisado este archivo primero.

## Filosofía de trabajo de Valdo (aplica también a Claude Code)

- Prioriza entender el _porqué_ sobre copiar código que funciona — explica
  conceptos nuevos de React/Next.js/TypeScript/Tailwind/shadcn/TanStack Query/React Hook Form/Zod cuando aparezcan, no solo el fix.
- Construye patrones a mano un par de veces antes de abstraerlos — no ofrecer
  abstracciones/helpers antes de que el patrón repetido ya se sienta mecánico.
- Prefiere decisiones de alcance explícitas ("¿lo hacemos ahora o lo anotamos para
  después?") sobre asumir silenciosamente cuánto construir.
- Commits atómicos siempre, confirmando `git status`/`git diff` antes de armar el
  mensaje — nunca asumir qué cambió sin verlo.
