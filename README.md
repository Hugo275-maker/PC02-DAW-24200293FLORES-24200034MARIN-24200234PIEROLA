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
│   ├─ countries.js          ← listar, buscarPorCapital, porContinente, porCodigo + toCountry (normalizador)
│   ├─ borders.js            ← fronteras alpha-3 -> nombre y alpha-2 (GET /borders/{alpha3})
│   └─ currencies.js         ← tasa(codigo), convertir(from, to, amount)
├─ utils/
│   ├─ format.js             ← flagUrl, formatPopulation, formatArea, joinValues, nombres en español
│   └─ errors.js             ← mensajeDeError(err): único manejador de errores
├─ components/
│   ├─ CountryCard.vue       ← bandera, nombre, capital, población, continente, chip de moneda
│   ├─ FlagImage.vue         ← bandera de flagcdn con respaldo si no carga
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
- [x] `countries.js`: respuestas normalizadas con `toCountry()` (un mismo formato de país para todos, en español).
- [x] `CountryFilters.vue`: buscador con debounce + selector de continente (`REGIONS`).
- [x] `CountriesPage.vue`: carga inicial, búsqueda por capital, filtro por continente (y ambos combinados), paginación con *Cargar más*, filtros guardados en la URL.
- [x] Estados: skeletons mientras carga, `q-banner` con *Reintentar* si falla, estado vacío con *Limpiar filtros*.

### Objeto `country` normalizado (lo que reciben `CountryCard` y `CountryDetailPage`)

```js
{
  code: 'PE', alpha3: 'PER', name: 'Perú', officialName: 'República del Perú',
  capital: 'Lima', population: 34157732, area: 1285216,
  region: 'Americas', continent: 'Sudamérica', subregion: 'South America',
  languages: ['Aimara', 'Quechua', 'Español'], timezones: ['UTC-05:00'],
  callingCodes: ['+51'], tlds: ['.pe'], drivingSide: 'Derecha',
  borders: ['BOL', 'BRA', 'CHL', 'COL', 'ECU'],          // ALPHA-3
  currency: { code: 'PEN', name: 'Sol peruano', symbol: 'S/' },
  currencies: [ /* todas las monedas */ ]
}
```

Helpers en `src/utils/format.js`: `flagUrl(code, 160)`, `formatPopulation(n)` → `34.2 M`, `formatArea(km2)` → `1 285 216 km²`, `joinValues(arr)`.
`porCodigo(code)` ya devuelve el país normalizado (o `null`) y `mensajeDeError(err)` (`src/utils/errors.js`) da un mensaje listo para mostrar.

**Ana — Tarjeta y Pantalla 2 (detalle)**
- [x] `CountryCard.vue`: bandera `https://flagcdn.com/w160/{alpha2}.png`, nombre, capital, población (ej. `34.0 M`), chip de continente y chip de moneda (`@click.stop` → emite `currency`).
- [x] `CountryDetailPage.vue`: `porCodigo(code)`; bandera grande (`w320`), nombre, continente, capital destacada, población, área, idiomas, zona horaria, código telefónico, dominio, lado de conducción.
- [x] Países fronterizos como chips → navegan a `/country/:code` (usar `watch(() => props.code)` para recargar).
- [x] Chip/tarjeta de moneda en el detalle → abre `CurrencyDialog`.

**Gabriela — Modal de moneda**
- [x] `currencies.js`: verificar la forma real de las respuestas de `/rates/{codigo}` y `/convert`.
- [x] `CurrencyDialog.vue`: al abrirse, pedir `tasa(code)` y mostrar `1 PEN = 0.27 USD`.
- [x] Conversor: `q-input type="number"` + botón **Convertir a USD** → `convertir(code, 'USD', monto)` y mostrar el resultado.
- [x] Estados de carga (`:loading` en el botón) y error (`q-banner` / `Notify`); validar monto > 0.

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
