// ------------------------------------------------------------------
// services/countries.js  —  RESPONSABLE: Hugo
// Todas las llamadas a la API Countries pasan por aquí.
// Cada función devuelve directamente los datos (response.data).
// ------------------------------------------------------------------
import { countriesApi } from 'boot/axios'

/** GET /countries/v5  — listado inicial */
export async function listar () {
  const { data } = await countriesApi.get('')
  return data
}

/** GET /countries/v5/capitals?q={texto} — búsqueda por capital */
export async function buscarPorCapital (texto) {
  const { data } = await countriesApi.get('/capitals', { params: { q: texto } })
  return data
}

/** GET /countries/v5/region/{continente} — filtro por continente */
export async function porContinente (continente) {
  const { data } = await countriesApi.get(`/region/${encodeURIComponent(continente)}`)
  return data
}

/** GET /countries/v5/codes.alpha_2/{codigo} — detalle de un país */
export async function porCodigo (codigo) {
  const { data } = await countriesApi.get(`/codes.alpha_2/${encodeURIComponent(codigo)}`)
  return data
}

// TODO (Hugo): normalizar la respuesta aquí para que los componentes reciban siempre lo mismo.
//
// Forma real de la respuesta (probada con /codes.alpha_2/pe):
//   response.data = { data: { objects: [ pais, ... ], meta: {...} } }
//   -> los países están en  data.data.objects   (siempre es un array, incluso en el detalle)
//
// Campos útiles de cada `pais`:
//   names.common ("Peru")  ·  names.translations.spa.common ("Perú")
//   codes.alpha_2 ("PE")   ·  codes.alpha_3 ("PER")
//   capitals[0].name ("Lima")
//   region ("Americas")  ·  subregion ("South America")  ·  continents[0] ("South America")
//   population (34157732)  ·  area.kilometers (1285216)
//   languages[].name  ·  timezones[] ("UTC-05:00")  ·  calling_codes[] ("51")
//   tlds[] (".pe")  ·  cars.driving_side ("right")
//   borders[] -> códigos ALPHA-3 ("BOL","BRA",...)  (ojo: la ruta de detalle usa alpha-2)
//   currencies[] -> [{ code: "PEN", name: "Peruvian sol", symbol: "S/" }]
//   flag.url_png / flag.url_svg  (igual usamos flagcdn.com como pide el PDF)
