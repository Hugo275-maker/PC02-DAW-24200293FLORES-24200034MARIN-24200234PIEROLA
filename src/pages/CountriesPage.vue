<!--
  CountriesPage.vue  —  Pantalla 1 (listado)  —  RESPONSABLE: Hugo
  - Carga inicial con listar()
  - Texto -> buscarPorCapital() · Continente -> porContinente() · Ambos -> búsqueda + filtro local
  - Estados: cargando (skeletons), error (banner + Reintentar), vacío, "Cargar más" (paginación)
  - Los filtros se guardan en la URL (?q=&continente=) para conservarlos al volver del detalle
  - Tarjeta 'select' -> /country/:code · chip 'currency' -> <CurrencyDialog>
-->
<template>
  <q-page class="countries-page">
    <header class="q-mb-md">
      <h1 class="page-title">Explorador de países</h1>
      <p class="page-subtitle">
        Busca por capital, filtra por continente, toca una tarjeta para ver el detalle o toca la moneda para ver su tasa
      </p>
    </header>

    <CountryFilters
      v-model:search="search"
      v-model:continent="continent"
      :loading="loading && countries.length > 0"
      class="q-mb-lg"
    />

    <!-- Error -->
    <q-banner v-if="error" rounded class="bg-red-1 text-negative q-mb-md">
      <template #avatar>
        <q-icon name="error_outline" color="negative" />
      </template>
      {{ error }}
      <template #action>
        <q-btn flat color="negative" label="Reintentar" icon="refresh" @click="load()" />
      </template>
    </q-banner>

    <!-- Cargando (primera carga o cambio de filtros) -->
    <div v-else-if="loading && countries.length === 0" class="row q-col-gutter-md">
      <div v-for="n in 8" :key="n" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card flat bordered class="q-pa-md">
          <div class="row items-center no-wrap q-gutter-sm">
            <q-skeleton type="rect" width="40px" height="28px" />
            <q-skeleton type="text" width="50%" />
          </div>
          <q-skeleton type="text" width="70%" class="q-mt-sm" />
          <div class="row q-gutter-sm q-mt-xs">
            <q-skeleton type="QChip" width="80px" />
            <q-skeleton type="QChip" width="60px" />
          </div>
        </q-card>
      </div>
    </div>

    <!-- Sin resultados -->
    <div v-else-if="!loading && countries.length === 0" class="empty-state column items-center q-pa-xl text-grey-7">
      <q-icon name="travel_explore" size="56px" color="grey-5" />
      <div class="text-subtitle1 q-mt-sm">No se encontraron países</div>
      <div class="text-caption q-mb-md">{{ emptyHint }}</div>
      <q-btn outline color="primary" no-caps label="Limpiar filtros" @click="clearFilters" />
    </div>

    <!-- Listado -->
    <template v-else>
      <div class="text-caption text-grey-7 q-mb-sm">
        Mostrando {{ countries.length }} de {{ total }} países
      </div>

      <div class="row q-col-gutter-md" :class="{ 'is-refreshing': loading }">
        <div v-for="c in countries" :key="c.code" class="col-12 col-sm-6 col-md-4 col-lg-3">
          <CountryCard :country="c" @select="goDetail" @currency="openCurrency" />
        </div>
      </div>

      <div v-if="more" class="row justify-center q-mt-lg">
        <q-btn
          unelevated
          no-caps
          color="primary"
          icon="expand_more"
          label="Cargar más"
          :loading="loadingMore"
          @click="loadMore"
        />
      </div>
    </template>

    <CurrencyDialog v-model="showCurrency" :currency="selectedCurrency" />
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import CountryFilters from 'components/CountryFilters.vue'
import CountryCard from 'components/CountryCard.vue'
import CurrencyDialog from 'components/CurrencyDialog.vue'
import {
  REGIONS,
  listar,
  buscarPorCapital,
  porContinente,
  errorMessage
} from 'src/services/countries'

defineOptions({ name: 'CountriesPage' })

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

// ---------- Filtros (sincronizados con la URL) ----------
const validRegions = REGIONS.map(r => r.value)
const queryToSearch = query => (typeof query.q === 'string' ? query.q.trim() : '')
const queryToContinent = query => (validRegions.includes(query.continente) ? query.continente : null)

const search = ref(queryToSearch(route.query))
const continent = ref(queryToContinent(route.query))

// ---------- Estado del listado ----------
const countries = ref([])
const total = ref(0)
const more = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')

let requestId = 0 // descarta respuestas viejas si el usuario cambia el filtro rápido
let nextOffset = 0 // offset de la siguiente página en la API

const emptyHint = computed(() => {
  const region = REGIONS.find(r => r.value === continent.value)?.label
  if (search.value && region) return `Ninguna capital de ${region} coincide con "${search.value}".`
  if (search.value) return `Ninguna capital coincide con "${search.value}".`
  return 'Prueba con otro continente.'
})

/** Elige el endpoint según los filtros activos */
async function fetchPage (offset) {
  const q = search.value
  const region = continent.value

  if (q && region) {
    // La API no combina ambos filtros: buscamos por capital y filtramos el continente en el cliente
    const page = await buscarPorCapital(q, { offset: 0, limit: 100 })
    const items = page.items.filter(c => c.region === region)
    return { items, total: items.length, more: false }
  }
  if (q) return buscarPorCapital(q, { offset })
  if (region) return porContinente(region, { offset })
  return listar({ offset })
}

/** Carga desde cero (al iniciar o al cambiar un filtro) */
async function load () {
  const id = ++requestId
  loading.value = true
  error.value = ''
  try {
    const page = await fetchPage(0)
    if (id !== requestId) return
    countries.value = page.items
    nextOffset = page.count
    total.value = page.total
    more.value = page.more
  } catch (err) {
    if (id !== requestId) return
    countries.value = []
    error.value = errorMessage(err)
  } finally {
    if (id === requestId) loading.value = false
  }
}

/** Paginación: agrega la siguiente página al final */
async function loadMore () {
  const id = requestId
  loadingMore.value = true
  try {
    const page = await fetchPage(nextOffset)
    if (id !== requestId) return
    const known = new Set(countries.value.map(c => c.code))
    countries.value.push(...page.items.filter(c => !known.has(c.code)))
    nextOffset += page.count
    total.value = page.total
    more.value = page.more
  } catch (err) {
    $q.notify({ type: 'negative', message: errorMessage(err) })
  } finally {
    loadingMore.value = false
  }
}

function clearFilters () {
  search.value = ''
  continent.value = null
}

// Filtros -> URL + recarga
watch([search, continent], ([q, region]) => {
  if (q !== queryToSearch(route.query) || region !== queryToContinent(route.query)) {
    router.replace({ query: { ...(q && { q }), ...(region && { continente: region }) } })
  }
  load()
})

// URL -> filtros (botón atrás/adelante o enlace pegado)
watch(() => route.query, query => {
  search.value = queryToSearch(query)
  continent.value = queryToContinent(query)
})

onMounted(load)

// ---------- Navegación y modal de moneda ----------
const showCurrency = ref(false)
const selectedCurrency = ref(null)

function goDetail (code) {
  router.push({ name: 'country-detail', params: { code: code.toLowerCase() } })
}

function openCurrency (currency) {
  if (!currency) return
  selectedCurrency.value = currency
  showCurrency.value = true
}
</script>

<style scoped>
.countries-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}

.page-title {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 700;
  color: #1f2937;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.is-refreshing {
  opacity: 0.55;
  transition: opacity 0.2s;
}
</style>
