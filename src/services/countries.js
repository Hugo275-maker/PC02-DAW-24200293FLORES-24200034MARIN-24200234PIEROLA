// ------------------------------------------------------------------
// services/countries.js  —  RESPONSABLE: Hugo
// Todas las llamadas a la API Countries pasan por aquí.
//
// La API responde:  { data: { objects: [ pais, ... ], meta: { total, count, limit, offset, more } } }
// Este servicio NORMALIZA cada país (ver toCountry) para que los componentes
// reciban siempre el mismo objeto, ya en español y listo para mostrar.
// ------------------------------------------------------------------
import { countriesApi } from 'boot/axios'

export const PAGE_SIZE = 24

// ---------- Continentes ----------

/** Valores que acepta /region/{continente} (campo `region` de la API) */
export const REGIONS = [
  { value: 'Africa', label: 'África' },
  { value: 'Americas', label: 'América' },
  { value: 'Asia', label: 'Asia' },
  { value: 'Europe', label: 'Europa' },
  { value: 'Oceania', label: 'Oceanía' },
  { value: 'Antarctic', label: 'Antártida' }
]

/** Campo `continents` de la API -> español (lo que se muestra en la tarjeta) */
const CONTINENTS_ES = {
  Africa: 'África',
  Antarctica: 'Antártida',
  Asia: 'Asia',
  Europe: 'Europa',
  'North America': 'Norteamérica',
  'South America': 'Sudamérica',
  Oceania: 'Oceanía'
}

const DRIVING_SIDE_ES = { right: 'Derecha', left: 'Izquierda' }

// ---------- Normalización ----------

/**
 * Convierte un país crudo de la API en el objeto que usa la app.
 * @returns {{
 *   code: string, code3: string, name: string, officialName: string,
 *   capital: string, population: number, area: number|null,
 *   region: string, continent: string, subregion: string,
 *   languages: string[], timezones: string[], callingCodes: string[],
 *   tlds: string[], drivingSide: string, borders: string[],
 *   currency: {code: string, name: string, symbol: string}|null,
 *   currencies: {code: string, name: string, symbol: string}[]
 * }}
 */
export function toCountry (raw) {
  const spa = raw.names?.translations?.spa
  const continentEn = raw.continents?.[0] ?? raw.region ?? ''
  const currencies = (raw.currencies ?? []).map(c => ({
    code: c.code,
    name: c.name,
    symbol: c.symbol ?? c.code
  }))

  return {
    code: raw.codes?.alpha_2 ?? '',
    code3: raw.codes?.alpha_3 ?? '',
    name: spa?.common ?? raw.names?.common ?? '',
    officialName: spa?.official ?? raw.names?.official ?? '',
    capital: raw.capitals?.find(c => c.attributes?.primary)?.name ?? raw.capitals?.[0]?.name ?? '—',
    population: raw.population ?? null,
    area: raw.area?.kilometers ?? null,
    region: raw.region ?? '',
    continent: CONTINENTS_ES[continentEn] ?? continentEn,
    subregion: raw.subregion ?? '',
    languages: (raw.languages ?? []).map(l => l.name),
    timezones: raw.timezones ?? [],
    callingCodes: (raw.calling_codes ?? []).map(c => `+${c}`),
    tlds: raw.tlds ?? [],
    drivingSide: DRIVING_SIDE_ES[raw.cars?.driving_side] ?? '—',
    borders: raw.borders ?? [], // códigos ALPHA-3
    currency: currencies[0] ?? null,
    currencies
  }
}

/**
 * Extrae y normaliza { items, count, total, more } de una respuesta de la API.
 * `count` = objetos que devolvió la API (sirve para calcular el siguiente offset).
 */
function toPage (body) {
  const objects = body?.data?.objects ?? []
  const meta = body?.data?.meta ?? {}
  return {
    items: objects.map(toCountry).filter(c => c.code), // sin alpha-2 no hay bandera ni detalle
    count: objects.length,
    total: meta.total ?? objects.length,
    more: Boolean(meta.more)
  }
}

/** Mensaje de error entendible para el usuario */
export function errorMessage (err) {
  const status = err?.response?.status
  if (status === 401 || status === 403) return 'API key inválida o ausente. Revisa VITE_API_KEY en el archivo .env.'
  if (status === 404) return 'No se encontró la información solicitada.'
  if (status === 429) return 'Se alcanzó el límite de solicitudes de la API. Intenta más tarde.'
  if (!err?.response) return 'No se pudo conectar con la API. Revisa tu conexión a internet.'
  return err?.response?.data?.errors?.[0]?.message ?? 'Ocurrió un error inesperado.'
}

// ---------- Endpoints ----------

/** GET /countries/v5 — listado inicial (paginado) */
export async function listar ({ offset = 0, limit = PAGE_SIZE } = {}) {
  const { data } = await countriesApi.get('', { params: { offset, limit } })
  return toPage(data)
}

/** GET /countries/v5/capitals?q={texto} — búsqueda por capital */
export async function buscarPorCapital (texto, { offset = 0, limit = PAGE_SIZE } = {}) {
  const { data } = await countriesApi.get('/capitals', { params: { q: texto, offset, limit } })
  return toPage(data)
}

/** GET /countries/v5/region/{continente} — filtro por continente */
export async function porContinente (continente, { offset = 0, limit = PAGE_SIZE } = {}) {
  const { data } = await countriesApi.get(`/region/${encodeURIComponent(continente)}`, { params: { offset, limit } })
  return toPage(data)
}

/** GET /countries/v5/codes.alpha_2/{codigo} — detalle de un país (o null si no existe) */
export async function porCodigo (codigo) {
  const { data } = await countriesApi.get(`/codes.alpha_2/${encodeURIComponent(codigo)}`)
  return toPage(data).items[0] ?? null
}
