// ------------------------------------------------------------------
// services/currencies.js  —  RESPONSABLE: Gabriela
// Todas las llamadas a la API Currencies pasan por aquí.
// Cada función devuelve un objeto simple y ya "limpio" para el componente.
// ------------------------------------------------------------------
import { currenciesApi } from 'boot/axios'

// La API siempre responde así:  { data: { objects: [ {...} ] } }
// Esta función saca ese primer objeto o lanza un error si no vino nada.
function primerObjeto (respuesta) {
  const obj = respuesta?.data?.objects?.[0]
  if (!obj) throw new Error('La API no devolvió datos para esta moneda')
  return obj
}

/**
 * GET /currencies/v1/rates/{codigoMoneda} — tasa de cambio
 * Respuesta real: { data: { objects: [ { base: "PEN", as_of: 1795046400, rates: { USD: 0.29, ... } } ] } }
 * Devuelve: { rate: 0.29, asOf: 1795046400 }
 */
export async function tasa (codigo) {
  // 1 USD siempre vale 1 USD: no gastamos una request en eso
  if (codigo === 'USD') return { rate: 1, asOf: null }

  const { data } = await currenciesApi.get(`/rates/${encodeURIComponent(codigo)}`)
  const obj = primerObjeto(data)
  const rate = obj.rates?.USD

  if (rate === undefined || rate === null) {
    throw new Error(`No hay tasa disponible de ${codigo} frente a USD`)
  }
  return { rate, asOf: obj.as_of ?? null }
}

/**
 * GET /currencies/v1/convert?from=&to=&amount= — conversión de montos
 * Respuesta (docs): { data: { objects: [ { from: {...}, to: {...}, amount: 100, rate: 0.87, result: 87.7, as_of: ... } ] } }
 * Devuelve: { result: 87.7, rate: 0.87, asOf: ... }
 */
export async function convertir (from, to, amount) {
  if (from === to) return { result: amount, rate: 1, asOf: null }

  const { data } = await currenciesApi.get('/convert', { params: { from, to, amount } })
  const obj = primerObjeto(data)
  return { result: obj.result, rate: obj.rate, asOf: obj.as_of ?? null }
}

// El manejo de errores es común a toda la app (utils/errors.js)
export { mensajeDeError } from 'src/utils/errors'
