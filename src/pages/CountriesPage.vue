<!--
  CountriesPage.vue  —  Pantalla 1 (listado)  —  RESPONSABLE: Hugo
  - Carga inicial con listar()
  - Si hay texto -> buscarPorCapital(); si hay continente -> porContinente()
  - Estados: loading (q-spinner / q-skeleton), error (q-banner + reintentar), vacío
  - Grid de <CountryCard>; al 'select' -> ir a /country/:code
  - Al 'currency' -> abrir <CurrencyDialog>
-->
<template>
  <q-page padding>
    <div class="text-h5 text-weight-bold">Explorador de países</div>
    <div class="text-caption text-grey-7 q-mb-md">
      Busca por capital, filtra por continente, toca una tarjeta para ver el detalle o toca la moneda para ver su tasa
    </div>

    <CountryFilters v-model:search="search" v-model:continent="continent" class="q-mb-md" />

    <!-- TODO (Hugo): loading / error / vacío -->

    <div class="row q-col-gutter-md">
      <div v-for="c in countries" :key="c.code" class="col-12 col-sm-6 col-md-3">
        <CountryCard :country="c" @select="goDetail" @currency="openCurrency" />
      </div>
    </div>

    <CurrencyDialog v-model="showCurrency" :currency="selectedCurrency" />
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CountryFilters from 'components/CountryFilters.vue'
import CountryCard from 'components/CountryCard.vue'
import CurrencyDialog from 'components/CurrencyDialog.vue'

defineOptions({ name: 'CountriesPage' })

const router = useRouter()

const search = ref('')
const continent = ref(null)
const countries = ref([])

const showCurrency = ref(false)
const selectedCurrency = ref(null)

function goDetail (code) {
  router.push({ name: 'country-detail', params: { code } })
}

function openCurrency (currency) {
  selectedCurrency.value = currency
  showCurrency.value = true
}

// TODO (Hugo): onMounted -> listar(); watch(search / continent) -> buscar / filtrar
</script>
