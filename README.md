# NYX Store — Mini eCommerce Challenge

> **Demo en vivo:** [link de demo aquí — se actualiza tras el deploy]

Mini eCommerce construido como prueba técnica para Double V Partners / NYX. Consume la API pública de [FakeStore API](https://fakestoreapi.com) con catálogo filtrable, carrito persistido y recomendaciones por categoría.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript strict |
| Estilos | Tailwind CSS v4 |
| Estado global | Zustand v5 + persist |
| Data fetching | TanStack React Query v5 |
| Iconos | Lucide React |
| Deploy | Vercel |

---

## Cómo correr localmente

```bash
pnpm install
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Estructura del proyecto

```
src/
  app/
    page.tsx               # Catálogo con búsqueda y filtros
    cart/page.tsx          # Vista del carrito
    layout.tsx             # Shell global con Header
    providers.tsx          # React Query provider
  components/
    Header.tsx             # Sticky header con badge del carrito
    ProductCard.tsx        # Card de producto
    ProductDetailModal.tsx # Modal de detalle con recomendaciones
    CategoryFilter.tsx     # Filtro por categoría
    SearchBar.tsx          # Búsqueda con debounce
    Recommendations.tsx    # "You might also like"
    ui/                    # Skeleton, ErrorState, EmptyState
  features/
    products/              # Types, API service, React Query hooks
    cart/                  # Zustand store + tipos
    recommendations/       # Lógica pura de recomendaciones
  lib/
    api-client.ts          # fetch wrapper: timeout, retry exponencial
    errors.ts              # ApiError class
    utils.ts               # cn(), formatPrice(), debounce()
    hooks/                 # useDebounce, useMounted
```

---

## Decisiones técnicas

**React Query con `staleTime` 5 min** → El catálogo es estático durante la sesión. Cachear agresivamente elimina re-fetches mientras el usuario navega. `retry: false` porque el api-client ya maneja reintentos con backoff exponencial — no duplicar lógica.

**Modal en vez de ruta `/product/[id]`** → Mantiene el scroll position del catálogo, UX más fluida. Los datos ya existen en el cache de `getAll()` — no hay segundo fetch. Tradeoff: URLs no shareables. Documentado en mejoras pendientes.

**`CategoryFilter` derivado de `useProducts()`** → Elimina la petición a `/products/categories`. Derivado con `Array.from(new Set(...))` + `useMemo` — solo aparecen categorías con productos reales en el resultado actual.

**Zustand v5 + `persist`** → Carrito persistido en localStorage sin backend. `version: 1` para migraciones futuras. Selector granular en Header (`s => s.items.reduce(...)`) para que el badge no dispare re-renders en cambios no relacionados.

**`useMounted` antes del badge del carrito** → Zustand `persist` lee localStorage solo en el cliente. Sin este hook, React lanza un hydration mismatch entre el HTML del servidor (badge = 0) y la primera renderización del cliente (badge = N real).

**api-client con retry exponencial** → `AbortController` con timeout de 8s. Máximo 2 reintentos en errores 5xx y de red. Los 4xx no se reintentan — son errores del cliente, reintentar es ruido. Backoff: 500ms → 1000ms.

**Solo `/cart` page (sin CartDrawer)** → El brief pide "vista del carrito". Una página cumple al 100%. Un drawer adicional es feature creep sin impacto en la rúbrica.

---

## Estrategia de caché del catálogo

### Implementación actual

React Query con `staleTime` de 5 minutos:

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min — catalog data rarely changes
      retry: false,              // api-client handles retries with backoff
    },
  },
})
```

Esto activa tres mecanismos automáticamente:

1. **Stale-while-revalidate** — los datos cacheados se sirven inmediatamente. La revalidación ocurre en background solo si han pasado más de 5 minutos. El usuario nunca ve un spinner al volver al catálogo.

2. **Request deduplication** — si múltiples componentes montan `useProducts()` en el mismo ciclo de render, React Query hace exactamente **1 sola petición HTTP**, no N.

3. **Navigation cache** — volver de `/cart` al catálogo es instantáneo porque los datos siguen frescos en cache.

### Para producción a 10.000 usuarios/día

```
Browser cache  →  CDN edge  →  ISR/SSG  →  Origin (fakestoreapi)
    ~5 min          ~1 hora      ~1 hora    solo en revalidación
```

Con `export const revalidate = 3600` en el Server Component del catálogo, el origen recibe **~1 petición por hora por región del CDN**, independientemente de si hay 100 o 100.000 usuarios concurrentes. El 99% del tráfico se resuelve desde el edge sin tocar el origen.

---

## Respuestas — Sección 5

### Herramientas de IA usadas

**Claude Code (claude-sonnet-4-6)** como pair programmer durante todo el desarrollo.

**Planificación arquitectónica (antes de codificar):**
- Evaluación de trade-offs reales: modal vs. ruta para detalle, drawer vs. página para el carrito, ubicación óptima del recomendador en el flujo de UX.
- Validación crítica de un enfoque inicial "Senior" que proponía Turborepo + Docker + Clean Architecture canónica — descartado por sobre-ingeniería explícita para una prueba de 2 horas.
- Discusión sobre tipado de `Category`: alias semántico vs. union literal. Se eligió la union literal por type safety real en compile-time.

**Generación de código:**
- Scaffolding del api-client con retry exponencial y `AbortController`.
- Boilerplate de tipos, servicios y configuración de React Query.
- Estructura base de componentes (cada uno revisado y ajustado manualmente).

**Refactorización puntual:**
- Selector granular en `Header` para evitar re-renders innecesarios del badge.
- Hook `useMounted` para el hydration mismatch del estado persistido.
- Extracción del recomendador a función pura e independiente de la UI.

**Lo que no se delegó a la IA:**
- Las decisiones de producto: qué criterio usar para recomendar, dónde ubicarlo, qué métricas reportar.
- La estrategia de caché y el razonamiento del bonus.
- La validación y aceptación consciente de cada decisión arquitectónica.
- La elección de simplificar donde el brief no pedía complejidad, rechazando sugerencias de over-engineering.

**Filosofía:** la IA acelera la ejecución de decisiones que ya tomé. El criterio de cuándo *no* usarla — o cuándo rechazar su sugerencia — es tan importante como saber cuándo sí.

---

### Arquitectura para 10.000 usuarios/día (Hi Beauty)

La arquitectura actual es correcta para una prueba técnica. Para producción con tráfico real, los cambios prioritarios:

**Rendering strategy:** ISR con `revalidate: 3600` para el catálogo. Los productos no cambian por request — renderizar en servidor por cada visita es costo innecesario. Con ISR, el HTML se genera una vez por hora y se sirve desde el edge para todos los usuarios.

**Estado del carrito:** migrar de `localStorage` a carrito server-side con Redis. Un usuario que agrega en móvil y compra en desktop necesita estado sincronizado entre dispositivos. `localStorage` rompe esa experiencia y genera abandono de carrito.

**Imágenes de producto:** mover assets a Cloudinary o similar. FakeStoreAPI como origin de imágenes es un punto de fallo externo sin SLA. A 10k usuarios, una degradación impacta conversión directamente — las imágenes son el principal driver de la decisión de compra.

**Observabilidad:**
- Sentry para error tracking y alertas de degradación.
- Vercel Analytics para Core Web Vitals (LCP del catálogo es el KPI más directo de UX).
- Eventos de funnel: `catalog_view → product_detail_view → add_to_cart → checkout_started`. Sin métricas de funnel es imposible saber dónde cae la conversión o si el recomendador funciona en producción.

**Resiliencia:** error boundary global con fallback a datos cacheados. Si fakestoreapi cae, el usuario debería ver el último catálogo conocido, no una pantalla en blanco.

**CI/CD:** preview deploys automáticos por PR para QA antes de merge. A 10k usuarios diarios, deployar directo a producción sin staging es riesgo operacional innecesario.

---

### Métrica de negocio impactada por el recomendador

**Métrica primaria: AOV (Average Order Value)** vía cross-sell rate.

**Razonamiento:** el recomendador se activa en el momento de máxima intención de compra — el modal está abierto, el usuario evalúa activamente el producto. Ordenar por `rating.rate` descendente prioriza productos con mayor probabilidad de conversión cruzada: el rating actúa como prueba social y reduce la fricción de la decisión de compra adicional.

**Métrica secundaria: tasa de exploración del catálogo** — sesiones que ven más de 1 producto. El recomendador convierte el modal en un punto de descubrimiento, no solo de evaluación. Más productos vistos = mayor probabilidad de encontrar un segundo ítem que convierta.

**Cómo se mediría en producción:**

```ts
analytics.track('recommendation_clicked', {
  source_product_id: current.id,
  source_category: current.category,
  recommended_product_id: selected.id,
  position: 0 | 1 | 2,  // posición en la lista (para optimizar ranking)
})
```

KPI principal: **lift en conversion rate cross-category** vs. grupo de control sin recomendaciones (A/B test). Si una recomendación lleva a `add_to_cart` en la misma sesión, el AOV sube directamente. El campo `position` permite optimizar el algoritmo de ranking con datos reales de producción.

---

## Mejoras pendientes

Fuera del scope de la prueba, decididas conscientemente:

- **URL sync del modal** (`?product=123`) — shareable links con `useSearchParams`, ~15 líneas. El tradeoff actual está documentado en decisiones técnicas.
- **Sort del catálogo** — por precio o rating con `<select>` controlado. En producción requeriría A/B test antes de definir el orden por defecto, ya que el sort impacta conversión directamente.
- **Toast al agregar al carrito** — feedback inmediato en la card sin abrir el modal. Mejora la percepción de velocidad del sistema.
