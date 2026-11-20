// ------------------------------------------------------------------
// boot/axios.js  —  BASE COMÚN (no modificar sin avisar al equipo)
// Dos instancias de axios, una por API, ambas con el header Bearer.
// La key se lee de .env  ->  VITE_API_KEY=tu_key
// ------------------------------------------------------------------
import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

const API_KEY = import.meta.env.VITE_API_KEY

if (!API_KEY) {
  console.warn('[axios] Falta VITE_API_KEY en el archivo .env (copia .env.example a .env)')
}

const authHeaders = { Authorization: `Bearer ${API_KEY}` }

export const countriesApi = axios.create({
  baseURL: 'https://api.restcountries.com/countries/v5',
  headers: authHeaders
})

export const currenciesApi = axios.create({
  baseURL: 'https://api.restcountries.com/currencies/v1',
  headers: authHeaders
})

export default defineBoot(({ app }) => {
  // Disponibles también como this.$countriesApi / this.$currenciesApi (Options API)
  app.config.globalProperties.$countriesApi = countriesApi
  app.config.globalProperties.$currenciesApi = currenciesApi
})
