// ------------------------------------------------------------------
// services/borders.js  —  RESPONSABLE: Ana (detalle)
// `borders` llega como códigos ALPHA-3 ("BOL"), pero la ruta de detalle usa alpha-2 ("BO").
// Esta función les pone nombre y alpha-2 con UNA sola petición:
//   GET /countries/v5/borders/{alpha3}  -> países que limitan con ese país.
// Guarda lo que ya conoce en memoria para no gastar requests (plan Free: 1000/mes).
// ------------------------------------------------------------------
import { countriesApi } from 'boot/axios'
import { toCountry } from 'src/services/countries'

const FIELDS = 'names.common,names.translations.spa,codes.alpha_2,codes.alpha_3'
const known = new Map() // alpha3 -> { alpha3, code (alpha2), name }

/** Registra países ya normalizados (por ejemplo, los del listado) para reutilizar su nombre. */
export function registrarPaises (paises = []) {
  for (const c of paises) {
    if (c.alpha3) known.set(c.alpha3, { alpha3: c.alpha3, code: c.code, name: c.name })
  }
}

/** Devuelve [{ alpha3, code, name }] en el mismo orden que country.borders. */
export async function resolverFronteras (country) {
  registrarPaises([country])
  const wanted = country.borders ?? []
  if (!wanted.length) return []

  if (wanted.some(alpha3 => !known.has(alpha3))) {
    const { data } = await countriesApi.get(`/borders/${encodeURIComponent(country.alpha3)}`, {
      params: { limit: 100, response_fields: FIELDS }
    })
    registrarPaises((data?.data?.objects ?? []).map(toCountry))
  }

  // Lo que siga sin resolverse queda con el código alpha-3 como nombre (y sin enlace).
  return wanted.map(alpha3 => known.get(alpha3) ?? { alpha3, code: '', name: alpha3 })
}
