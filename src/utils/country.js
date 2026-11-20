// ------------------------------------------------------------------
// utils/country.js  —  Ayudas compartidas para leer países de la API
//
// normalizeCountry(raw)  -> convierte un país crudo de la API en un objeto plano.
//   * Es idempotente: si ya viene normalizado (tiene `code` y no `codes`), lo devuelve igual.
//   * Así CountryCard y el detalle funcionan tanto con el JSON crudo como con lo que
//     normalice services/countries.js (Hugo).
// extractObjects(res)    -> saca el array de países de cualquier forma de respuesta
//   ({ data: { objects } }, { objects } o un array).
// ------------------------------------------------------------------
import {
  CONTINENT_LABELS,
  DRIVING_SIDE_LABELS,
  countryNameEs,
  currencyNameEs,
  languageNameEs
} from './format.js'

export function extractObjects (res) {
  if (Array.isArray(res)) return res
  return res?.data?.objects ?? res?.objects ?? []
}

export function normalizeCountry (raw = {}) {
  if (raw?.code && !raw.codes) return raw // ya normalizado

  const alpha2 = raw.codes?.alpha_2 ?? ''
  const alpha3 = raw.codes?.alpha_3 ?? ''
  const englishName = raw.names?.common ?? alpha2

  const capitals = raw.capitals ?? []
  const primaryCapital = capitals.find((c) => c.attributes?.primary) ?? capitals[0]
  const continentRaw = raw.continents?.[0] ?? raw.region ?? ''

  return {
    code: alpha2, // alpha-2: es el que usa la ruta /country/:code
    alpha3,
    name: raw.names?.translations?.spa?.common || countryNameEs(alpha2, englishName),
    officialName: raw.names?.official ?? '',
    capital: primaryCapital?.name ?? '—',
    population: typeof raw.population === 'number' ? raw.population : null,
    area: typeof raw.area?.kilometers === 'number' ? raw.area.kilometers : null,
    continent: CONTINENT_LABELS[continentRaw] ?? continentRaw ?? '—',
    region: raw.region ?? '',
    currencies: (raw.currencies ?? []).map((c) => ({
      code: c.code,
      name: currencyNameEs(c.code, c.name),
      symbol: c.symbol ?? null
    })),
    languages: (raw.languages ?? []).map((l) =>
      languageNameEs(l.bcp47 || l.iso639_1 || l.iso639_3, l.name)
    ),
    timezones: raw.timezones ?? [],
    callingCodes: (raw.calling_codes ?? []).map((c) => `+${String(c).replace(/^\+/, '')}`),
    tlds: raw.tlds ?? [],
    drivingSide: DRIVING_SIDE_LABELS[raw.cars?.driving_side] ?? '—',
    borders: raw.borders ?? [] // códigos ALPHA-3
  }
}

/** "UTC-05:00, UTC-06:00 y 2 más" */
export function joinValues (values = [], max = 3) {
  if (!values.length) return '—'
  if (values.length <= max) return values.join(', ')
  return `${values.slice(0, max).join(', ')} y ${values.length - max} más`
}
