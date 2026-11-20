<!--
  CountryFilters.vue  —  RESPONSABLE: Hugo
  Buscador por capital + selector de continente.

  v-model:search     (String)      -> texto de búsqueda por capital
  v-model:continent  (String|null) -> valor de region de la API (null = todos)

  El q-input tiene debounce para no gastar requests (plan Free = 1000/mes).
-->
<template>
  <div class="country-filters row q-col-gutter-md items-end">
    <div class="col-12 col-sm">
      <label class="filter-label" for="filter-search">Buscar</label>
      <q-input
        for="filter-search"
        :model-value="search"
        outlined
        dense
        clearable
        bg-color="white"
        placeholder="Buscar por capital..."
        :debounce="400"
        :loading="loading"
        @update:model-value="val => emit('update:search', (val ?? '').trim())"
      >
        <template #prepend>
          <q-icon name="search" size="20px" />
        </template>
      </q-input>
    </div>

    <div class="col-12 col-sm-auto continent-col">
      <label class="filter-label" for="filter-continent">Continente</label>
      <q-select
        for="filter-continent"
        :model-value="continent"
        :options="options"
        outlined
        dense
        emit-value
        map-options
        bg-color="white"
        @update:model-value="val => emit('update:continent', val)"
      />
    </div>
  </div>
</template>

<script setup>
import { REGIONS } from 'src/services/countries'

defineOptions({ name: 'CountryFilters' })

defineProps({
  search: { type: String, default: '' },
  continent: { type: String, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:search', 'update:continent'])

const options = [{ value: null, label: 'Todos los continentes' }, ...REGIONS]
</script>

<style scoped>
.filter-label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--q-primary);
}

@media (min-width: 600px) {
  .continent-col {
    width: 220px;
  }
}
</style>
