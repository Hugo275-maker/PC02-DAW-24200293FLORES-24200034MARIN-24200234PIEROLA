<!--
  CountryDetailPage.vue  —  Pantalla 2 (ruta /country/:code)  —  RESPONSABLE: Ana
  - Recibe `code` por props (ver router/routes.js) y llama porCodigo(code)
  - Muestra: bandera grande (w320), nombre, continente, capital destacada, población, área,
    idiomas, zona horaria, código telefónico, dominio, lado de conducción y países fronterizos
    (chips; al tocar -> ir a ese país).
  - Al tocar la moneda -> <CurrencyDialog>
  - Estados de carga y error (con botón Reintentar)
  - watch(() => props.code) recarga al navegar entre países fronterizos
-->
<template>
  <q-page padding class="detail-page">
    <q-btn
      flat
      no-caps
      color="grey-8"
      icon="chevron_left"
      label="Volver al listado"
      :to="{ name: 'countries' }"
      class="q-mb-sm"
    />

    <q-card flat bordered class="detail-card">
      <!-- Cargando -->
      <div v-if="loading" aria-busy="true" aria-label="Cargando detalle del país">
        <div class="detail-head">
          <q-skeleton type="rect" width="112px" height="78px" />
          <div style="flex: 1">
            <q-skeleton type="text" width="50%" height="36px" />
            <q-skeleton type="QChip" />
          </div>
        </div>
        <q-skeleton type="rect" height="72px" class="q-my-md" />
        <div class="info-grid">
          <q-skeleton v-for="n in 8" :key="n" type="rect" height="58px" />
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="detail-error" role="alert">
        <q-icon name="error_outline" size="44px" color="negative" />
        <p class="detail-error__title">No pudimos cargar este país</p>
        <p class="detail-error__text">{{ error }}</p>
        <q-btn color="primary" unelevated no-caps icon="refresh" label="Reintentar" @click="load" />
      </div>

      <!-- Detalle -->
      <template v-else-if="country">
        <div class="detail-head">
          <FlagImage
            :code="country.code"
            size="w320"
            :width="112"
            :alt="`Bandera de ${country.name}`"
          />
          <div>
            <h1 class="detail-title">{{ country.name }}</h1>
            <q-chip dense color="blue-1" text-color="blue-9" :label="country.continent" class="q-ma-none" />
            <p v-if="country.officialName" class="detail-official">{{ country.officialName }}</p>
          </div>
        </div>

        <div class="detail-capital">
          <q-icon name="place" size="28px" />
          <div>
            <span class="detail-capital__label">Capital</span>
            <span class="detail-capital__value">{{ country.capital }}</span>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-tile">
            <span class="info-tile__label">Población</span>
            <span class="info-tile__value">{{ formatPopulation(country.population) }}</span>
          </div>

          <div class="info-tile">
            <span class="info-tile__label">Área</span>
            <span class="info-tile__value">
              {{ formatArea(country.area) }}
            </span>
          </div>

          <!-- Moneda: abre el modal con la tasa y el conversor -->
          <div v-if="country.currencies.length" class="currency-tiles">
            <button
              v-for="currency in country.currencies"
              :key="currency.code"
              type="button"
              class="info-tile info-tile--button"
              :aria-label="`Ver el tipo de cambio de ${currency.name} (${currency.code})`"
              @click="openCurrency(currency)"
            >
              <span class="info-tile__label">Moneda ›</span>
              <span class="info-tile__value">{{ currency.name }} ({{ currency.code }})</span>
            </button>
          </div>
          <div v-else class="info-tile">
            <span class="info-tile__label">Moneda</span>
            <span class="info-tile__value">—</span>
          </div>

          <div class="info-tile">
            <span class="info-tile__label">Idiomas</span>
            <span class="info-tile__value">{{ joinValues(country.languages, 4) }}</span>
          </div>

          <div class="info-tile">
            <span class="info-tile__label">Zona horaria</span>
            <span class="info-tile__value">{{ joinValues(country.timezones) }}</span>
          </div>

          <div class="info-tile">
            <span class="info-tile__label">Código telefónico</span>
            <span class="info-tile__value">{{ joinValues(country.callingCodes) }}</span>
          </div>

          <div class="info-tile">
            <span class="info-tile__label">Dominio</span>
            <span class="info-tile__value">{{ joinValues(country.tlds) }}</span>
          </div>

          <div class="info-tile">
            <span class="info-tile__label">Conducción</span>
            <span class="info-tile__value">{{ country.drivingSide }}</span>
          </div>
        </div>

        <section class="detail-borders" aria-labelledby="borders-title">
          <h2 id="borders-title" class="detail-borders__title">Países fronterizos</h2>

          <span v-if="!country.borders.length" class="text-grey-7">Sin fronteras terrestres.</span>

          <template v-else>
            <q-chip
              v-for="border in borders"
              :key="border.alpha3"
              dense
              :clickable="Boolean(border.code)"
              :label="border.name"
              :aria-label="border.code ? `Ver el detalle de ${border.name}` : undefined"
              @click="border.code && goToCountry(border.code)"
            />
            <q-spinner v-if="bordersLoading" size="18px" color="primary" aria-label="Cargando nombres" />
          </template>
        </section>
      </template>
    </q-card>

    <CurrencyDialog v-model="showCurrency" :currency="selectedCurrency" />
  </q-page>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import CurrencyDialog from 'components/CurrencyDialog.vue'
import FlagImage from 'components/FlagImage.vue'
import { porCodigo } from 'src/services/countries'
import { resolverFronteras } from 'src/services/borders'
import { mensajeDeError } from 'src/utils/errors'
import { formatArea, formatPopulation, joinValues } from 'src/utils/format'

defineOptions({ name: 'CountryDetailPage' })

const props = defineProps({
  code: { type: String, required: true }
})

const router = useRouter()

const country = ref(null)
const loading = ref(false)
const error = ref(null)
const borders = ref([]) // [{ alpha3, code, name }]
const bordersLoading = ref(false)

const showCurrency = ref(false)
const selectedCurrency = ref(null)

let token = 0 // descarta respuestas viejas si el usuario navega rápido entre países

async function load () {
  const myToken = ++token
  loading.value = true
  error.value = null
  country.value = null
  borders.value = []
  bordersLoading.value = false
  window.scrollTo(0, 0)

  try {
    const data = await porCodigo(props.code) // ya viene normalizado (o null)
    if (myToken !== token) return
    if (!data) {
      error.value = 'No encontramos información para este país.'
      return
    }
    country.value = data
    loading.value = false
    loadBorders(country.value, myToken)
  } catch (err) {
    if (myToken !== token) return
    error.value = mensajeDeError(err)
  } finally {
    if (myToken === token) loading.value = false
  }
}

async function loadBorders (c, myToken) {
  // Mientras llega la respuesta se muestran los códigos alpha-3; luego, los nombres.
  borders.value = c.borders.map((alpha3) => ({ alpha3, code: '', name: alpha3 }))
  if (!c.borders.length) return
  bordersLoading.value = true
  try {
    const resolved = await resolverFronteras(c)
    if (myToken === token) borders.value = resolved
  } catch {
    // Si falla, el detalle sigue siendo útil con los códigos alpha-3.
  } finally {
    if (myToken === token) bordersLoading.value = false
  }
}

function goToCountry (code) {
  router.push({ name: 'country-detail', params: { code } })
}

function openCurrency (currency) {
  selectedCurrency.value = currency
  showCurrency.value = true
}

watch(() => props.code, load, { immediate: true })
</script>

<style scoped>
.detail-page {
  max-width: 800px;
  margin: 0 auto;
}
.detail-card {
  padding: 28px;
  border-radius: 16px;
  border-color: #e3e6ea;
}
.detail-head {
  display: flex;
  align-items: center;
  gap: 20px;
}
.detail-title {
  margin: 0 0 6px;
  font-size: 1.7rem;
  line-height: 1.15;
  font-weight: 700;
}
.detail-official {
  margin: 6px 0 0;
  font-size: 0.82rem;
  color: #6b7684;
}
.detail-capital {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0 16px;
  padding: 16px 20px;
  border-radius: 12px;
  background: var(--q-primary);
  color: #fff;
}
.detail-capital__label {
  display: block;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.85;
}
.detail-capital__value {
  display: block;
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.2;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.info-tile {
  display: block;
  min-width: 0;
  padding: 12px 14px;
  border-radius: 10px;
  background: #f6f7f9;
  text-align: left;
}
.info-tile__label {
  display: block;
  font-size: 0.72rem;
  color: #6b7684;
}
.info-tile__value {
  display: block;
  margin-top: 2px;
  font-size: 0.95rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.currency-tiles {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.info-tile--button {
  width: 100%;
  border: 1px solid transparent;
  font: inherit;
  color: inherit;
  cursor: pointer;
}
.info-tile--button:hover {
  border-color: var(--q-primary);
}
.info-tile--button:focus-visible {
  outline: 3px solid var(--q-primary);
  outline-offset: 2px;
}
.detail-borders {
  margin-top: 18px;
}
.detail-borders__title {
  margin: 0 0 6px;
  font-size: 0.78rem;
  font-weight: 500;
  color: #6b7684;
}
.detail-borders .q-chip {
  margin: 0 6px 6px 0;
}
.detail-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 16px;
  text-align: center;
}
.detail-error__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}
.detail-error__text {
  margin: 0;
  max-width: 460px;
  color: #6b7684;
  font-size: 0.9rem;
}
@media (max-width: 720px) {
  .detail-card { padding: 20px 16px; }
  .info-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 420px) {
  .info-grid { grid-template-columns: minmax(0, 1fr); }
  .detail-head { flex-direction: column; align-items: flex-start; }
}
</style>
