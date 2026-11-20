// ------------------------------------------------------------------
// utils/format.js  —  helpers de presentación compartidos por todo el equipo
// ------------------------------------------------------------------

const NBSP = ' '

const isNumber = value => typeof value === 'number' && !Number.isNaN(value)

export function capitalize (text = '') {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text
}

/** URL de la bandera en flagcdn. width: 80 | 160 | 320 (miniaturas: 80/160) */
export function flagUrl (alpha2, width = 160) {
  if (!alpha2) return ''
  return `https://flagcdn.com/w${width}/${alpha2.toLowerCase()}.png`
}

/** 1285216 -> "1 285 216" (separador de miles con espacio) */
export function formatNumber (value) {
  if (!isNumber(value)) return '—'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value).replace(/,/g, NBSP)
}

/** 34157732 -> "34.2 M" · debajo del millón muestra el número completo */
export function formatPopulation (value) {
  if (!isNumber(value)) return '—'
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}${NBSP}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}${NBSP}M`
  return formatNumber(value)
}

/** 1285216 -> "1 285 216 km²" */
export function formatArea (km2) {
  return isNumber(km2) ? `${formatNumber(km2)}${NBSP}km²` : '—'
}

/** ["UTC-05:00", ...] -> "UTC-05:00, UTC-06:00 y 2 más" */
export function joinValues (values = [], max = 3) {
  if (!values.length) return '—'
  if (values.length <= max) return values.join(', ')
  return `${values.slice(0, max).join(', ')} y ${values.length - max} más`
}

// ---------- Nombres en español (Intl.DisplayNames) ----------

function makeDisplayNames (type) {
  try {
    return new Intl.DisplayNames(['es'], { type })
  } catch {
    return null
  }
}

const regionNames = makeDisplayNames('region')
const languageNames = makeDisplayNames('language')
const currencyNames = makeDisplayNames('currency')

function translate (displayNames, code, fallback) {
  if (!code) return fallback
  try {
    const value = displayNames?.of(code)
    return value && value !== code ? value : fallback
  } catch {
    return fallback
  }
}

/** "BR" -> "Brasil" */
export const countryNameEs = (alpha2, fallback) => translate(regionNames, alpha2, fallback)
/** "es" -> "Español" */
export const languageNameEs = (code, fallback) => capitalize(translate(languageNames, code, fallback))
/** "PEN" -> "Sol peruano" */
export const currencyNameEs = (code, fallback) => capitalize(translate(currencyNames, code, fallback))
