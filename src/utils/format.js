const NBSP = '\u00A0'

/** Minúsculas y sin tildes, para comparar textos. */
export function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function capitalize(text = '') {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text
}

/** 1 285 216 (separador de miles con espacio fino). */
export function formatNumber(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value).replace(/,/g, NBSP)
}

/** 34 038 000 -> "34.0 M". Debajo del millón muestra el número completo. */
export function formatPopulation(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}${NBSP}M`
  return formatNumber(value)
}

/** Tasas de cambio: hasta 4 cifras significativas (0.2703, 162.2, 0.00006173). */
export function formatRate(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('es-PE', { maximumSignificantDigits: 4 }).format(value)
}

/** Montos convertidos: siempre 2 decimales. */
export function formatAmount(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

// ---------- Nombres en español (Intl.DisplayNames) ----------

function makeDisplayNames(type) {
  try {
    return new Intl.DisplayNames(['es'], { type })
  } catch {
    return null
  }
}

const regionNames = makeDisplayNames('region')
const languageNames = makeDisplayNames('language')
const currencyNames = makeDisplayNames('currency')

function translate(displayNames, code, fallback) {
  if (!code) return fallback
  try {
    const value = displayNames?.of(code)
    return value && value !== code ? value : fallback
  } catch {
    return fallback
  }
}

export const countryNameEs = (alpha2, fallback) => translate(regionNames, alpha2, fallback)
export const languageNameEs = (code, fallback) => capitalize(translate(languageNames, code, fallback))
export const currencyNameEs = (code, fallback) => capitalize(translate(currencyNames, code, fallback))

// ---------- Continentes ----------

/** Etiqueta en español del continente que muestra cada tarjeta. */
export const CONTINENT_LABELS = {
  Africa: 'África',
  Antarctica: 'Antártida',
  Asia: 'Asia',
  Europe: 'Europa',
  'North America': 'Norteamérica',
  Oceania: 'Oceanía',
  'South America': 'Sudamérica'
}

/**
 * Opciones del selector. El valor es lo que espera el endpoint
 * GET /countries/v5/region/{continente} (campo `region` de la API).
 */
export const REGION_OPTIONS = [
  { label: 'Todos los continentes', value: '' },
  { label: 'África', value: 'Africa' },
  { label: 'América', value: 'Americas' },
  { label: 'Asia', value: 'Asia' },
  { label: 'Europa', value: 'Europe' },
  { label: 'Oceanía', value: 'Oceania' }
]

export const DRIVING_SIDE_LABELS = { left: 'Izquierda', right: 'Derecha' }
