// ------------------------------------------------------------------
// utils/format.js  —  helpers de presentación compartidos por todo el equipo
// ------------------------------------------------------------------

/** URL de la bandera en flagcdn. width: 80 | 160 | 320 (miniaturas: 80/160) */
export function flagUrl (alpha2, width = 160) {
  if (!alpha2) return ''
  return `https://flagcdn.com/w${width}/${alpha2.toLowerCase()}.png`
}

/** 34157732 -> "34.2 M" · 38900 -> "38.9 K" · 800 -> "800" */
export function formatPopulation (n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)} K`
  return String(n)
}

/** 1285216 -> "1 285 216 km²" */
export function formatArea (km2) {
  if (km2 == null) return '—'
  return `${Math.round(km2).toLocaleString('es-PE').replace(/[.,]/g, ' ')} km²`
}
