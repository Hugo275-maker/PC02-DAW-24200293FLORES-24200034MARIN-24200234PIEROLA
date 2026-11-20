# PC02 - Country Explorer

Aplicación **Vue 3 (Composition API, `<script setup>`) + Quasar** que consume la API **RestCountries**:
listado de países con búsqueda y filtro, vista de detalle y panel de tipo de cambio.

**Integrantes:** Flores (24200293) · Marín (24200034) · Piérola (24200234)

---

## Cómo ejecutar

```bash
npm install
cp .env.example .env      # y poner tu key: VITE_API_KEY=tu_key
npm run dev
```

> La key se obtiene gratis en restcountries.com/sign-up (plan Free: 1000 requests/mes).
> **El archivo `.env` NO se sube** (está en `.gitignore`). Cada uno usa su propia key.

## Estructura

```
src/
├─ boot/axios.js             ← 2 instancias: countriesApi y currenciesApi, con header Bearer
├─ services/
│   ├─ countries.js          ← listar, buscarPorCapital, porContinente, porCodigo
│   └─ currencies.js         ← tasa(codigo), convertir(from, to, amount)
├─ components/
│   ├─ CountryCard.vue       ← bandera, nombre, capital, población, continente, chip de moneda
│   ├─ CountryFilters.vue    ← buscador por capital + selector de continente
│   └─ CurrencyDialog.vue    ← modal: nombre/código/símbolo, tasa vs USD, conversor
├─ pages/
│   ├─ CountriesPage.vue     ← Pantalla 1 (listado)
│   └─ CountryDetailPage.vue ← Pantalla 2 (ruta /country/:code, reemplaza el listado)
├─ layouts/MainLayout.vue
└─ router/routes.js
.env            ← VITE_API_KEY=tu_key   (NO se sube)
.env.example    ← VITE_API_KEY=         (sí se sube)
```

---

## Reparto del trabajo

La **base** (configuración Quasar, `boot/axios.js`, `router/routes.js`, `MainLayout.vue`, `.env.example`)
ya está en `main`. Cada archivo tiene arriba un comentario con su **responsable** y lo que debe hacer.

| Persona | Rama | Archivos | Entregable |
|---|---|---|---|
| **Hugo** | `feature/listado` | `services/countries.js`, `components/CountryFilters.vue`, `pages/CountriesPage.vue` | **Pantalla 1**: carga inicial, búsqueda por capital, filtro por continente, estados de carga / error / vacío, navegación al detalle |
| **Ana** | `feature/detalle` | `components/CountryCard.vue`, `pages/CountryDetailPage.vue`, `layouts/MainLayout.vue` (estilos) | **Tarjeta + Pantalla 2**: diseño de la tarjeta, detalle completo del país, países fronterizos navegables, estados de carga / error |
| **Gabriela** | `feature/moneda` | `services/currencies.js`, `components/CurrencyDialog.vue` | **Modal de moneda**: nombre/código/símbolo, tasa vs USD, conversor a USD, estados de carga / error |

### Detalle por persona

**Hugo — Pantalla 1 (listado)**
- [ ] `countries.js`: verificar la forma real de las respuestas y normalizarlas (un mismo formato de país para todos).
- [ ] `CountryFilters.vue`: confirmar los valores válidos de continente para `/region/{continente}`.
- [ ] `CountriesPage.vue`: `onMounted → listar()`; `watch` de búsqueda (`buscarPorCapital`) y continente (`porContinente`).
- [ ] Estados: `q-skeleton`/`q-spinner` mientras carga, `q-banner` con botón *Reintentar* si falla, mensaje si no hay resultados.

**Ana — Tarjeta y Pantalla 2 (detalle)**
- [ ] `CountryCard.vue`: bandera `https://flagcdn.com/w160/{alpha2}.png`, nombre, capital, población (ej. `34.0 M`), chip de continente y chip de moneda (`@click.stop` → emite `currency`).
- [ ] `CountryDetailPage.vue`: `porCodigo(code)`; bandera grande (`w320`), nombre, continente, capital destacada, población, área, idiomas, zona horaria, código telefónico, dominio, lado de conducción.
- [ ] Países fronterizos como chips → navegan a `/country/:code` (usar `watch(() => props.code)` para recargar).
- [ ] Chip/tarjeta de moneda en el detalle → abre `CurrencyDialog`.

**Gabriela — Modal de moneda**
- [ ] `currencies.js`: verificar la forma real de las respuestas de `/rates/{codigo}` y `/convert`.
- [ ] `CurrencyDialog.vue`: al abrirse, pedir `tasa(code)` y mostrar `1 PEN = 0.27 USD`.
- [ ] Conversor: `q-input type="number"` + botón **Convertir a USD** → `convertir(code, 'USD', monto)` y mostrar el resultado.
- [ ] Estados de carga (`:loading` en el botón) y error (`q-banner` / `Notify`); validar monto > 0.

### Contratos entre componentes (no cambiar sin avisar)

| Componente | Props / v-model | Eventos |
|---|---|---|
| `CountryFilters` | `v-model:search` (String), `v-model:continent` (String \| null) | — |
| `CountryCard` | `country` (Object) | `select(code)`, `currency({ code, name, symbol })` |
| `CurrencyDialog` | `v-model` (Boolean), `currency` (`{ code, name, symbol }`) | — |

## Flujo de trabajo (Git)

1. `git pull origin main` y crear tu rama: `git checkout -b feature/<tu-rama>`.
2. Commits pequeños y con mensaje claro (`feat: ...`, `fix: ...`, `style: ...`).
3. `git push -u origin feature/<tu-rama>` y abrir **Pull Request hacia `main`**.
4. Otro integrante revisa y aprueba; no se hace push directo a `main`.
5. Solo toca los archivos que te tocan; si necesitas cambiar un contrato o la base, avisa al grupo.
