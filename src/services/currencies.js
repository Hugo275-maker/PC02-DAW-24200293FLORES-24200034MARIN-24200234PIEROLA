// ------------------------------------------------------------------
// services/currencies.js  —  RESPONSABLE: Gabriela
// Todas las llamadas a la API Currencies pasan por aquí.
// ------------------------------------------------------------------
import { currenciesApi } from 'boot/axios'

/** GET /currencies/v1/rates/{codigoMoneda} — tasa de cambio */
export async function tasa (codigo) {
  const { data } = await currenciesApi.get(`/rates/${encodeURIComponent(codigo)}`)
  return data
}

/** GET /currencies/v1/convert?from=&to=&amount= — conversión de montos */
export async function convertir (from, to, amount) {
  const { data } = await currenciesApi.get('/convert', { params: { from, to, amount } })
  return data
}

// TODO (Gabriela): extraer el valor de la tasa frente a USD / el monto convertido.
//
// Forma real de /rates/PEN (probada):
//   response.data = { data: { objects: [ { base: "PEN", as_of: 1795046400, rates: { USD: 0.29, EUR: 0.27, ... } } ] } }
//   -> tasa vs USD = data.data.objects[0].rates.USD
// /convert todavía no se ha probado: revisar su respuesta con console.log.
