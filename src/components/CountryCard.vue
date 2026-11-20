<!--
  CountryCard.vue  —  RESPONSABLE: Ana
  Tarjeta de un país en el listado.

  Props:  country (Object)  -> país normalizado (o el JSON crudo de la API: se normaliza aquí)
  Emits:  'select'   (code)      -> al tocar la tarjeta (ir al detalle)
          'currency' (currency)  -> al tocar el chip de moneda (abrir CurrencyDialog)

  Muestra: bandera (flagcdn), nombre, capital, población, continente y la moneda como q-chip.
  El chip usa @click.stop para que no dispare también 'select'.
-->
<template>
  <q-card
    flat
    bordered
    class="country-card cursor-pointer"
    tabindex="0"
    role="button"
    :aria-label="`Ver el detalle de ${data.name}`"
    @click="open"
    @keydown.enter.self.prevent="open"
    @keydown.space.self.prevent="open"
  >
    <div class="country-card__head">
      <FlagImage :code="data.code" size="w80" :width="44" />
      <h2 class="country-card__name">{{ data.name }}</h2>
    </div>

    <div class="country-card__meta">
      <span>Capital: {{ data.capital }}</span>
      <span><span class="sr-only">Población: </span>{{ formatPopulation(data.population) }}</span>
    </div>

    <div class="country-card__chips">
      <q-chip dense color="blue-1" text-color="blue-9" :label="data.continent" />
      <q-chip
        v-for="currency in data.currencies"
        :key="currency.code"
        dense
        clickable
        color="green-1"
        text-color="green-9"
        icon="paid"
        :label="currency.code"
        :aria-label="`Ver el tipo de cambio de ${currency.name} (${currency.code})`"
        @click.stop="emit('currency', currency)"
      />
    </div>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import FlagImage from 'components/FlagImage.vue'
import { normalizeCountry } from '../utils/country.js'
import { formatPopulation } from '../utils/format.js'

defineOptions({ name: 'CountryCard' })

const props = defineProps({
  country: { type: Object, required: true }
})

const emit = defineEmits(['select', 'currency'])

const data = computed(() => normalizeCountry(props.country))

function open () {
  emit('select', data.value.code)
}
</script>

<style scoped>
.country-card {
  padding: 16px;
  border-radius: 12px;
  border-color: #e3e6ea;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}
.country-card:hover {
  border-color: #c9d3df;
  box-shadow: 0 4px 14px rgba(20, 40, 70, 0.08);
}
.country-card:focus-visible {
  outline: 3px solid var(--q-primary);
  outline-offset: 2px;
}
.country-card__head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.country-card__name {
  margin: 0;
  font-size: 1.02rem;
  font-weight: 700;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.country-card__meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  font-size: 0.82rem;
  color: #6b7684;
}
.country-card__meta > span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.country-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}
.country-card__chips .q-chip {
  margin: 0;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
@media (prefers-reduced-motion: reduce) {
  .country-card { transition: none; }
}
</style>
