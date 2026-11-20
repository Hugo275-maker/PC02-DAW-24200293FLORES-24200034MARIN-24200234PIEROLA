<!--
  CountryFilters.vue  —  RESPONSABLE: Hugo
  Buscador por capital + selector de continente.

  v-model:search     (String)      -> texto de búsqueda por capital
  v-model:continent  (String|null) -> continente seleccionado (null = todos)

  Sugerencia: mantener el debounce del q-input para no gastar requests
  (plan Free = 1000/mes).
-->
<template>
  <div class="row q-col-gutter-md items-end">
    <div class="col-12 col-md-9">
      <q-input
        :model-value="search"
        outlined
        dense
        clearable
        label="Buscar por capital..."
        :debounce="400"
        @update:model-value="val => emit('update:search', val || '')"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
    <div class="col-12 col-md-3">
      <q-select
        :model-value="continent"
        :options="continentes"
        outlined
        dense
        emit-value
        map-options
        label="Continente"
        @update:model-value="val => emit('update:continent', val)"
      />
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'CountryFilters' })

defineProps({
  search: { type: String, default: '' },
  continent: { type: String, default: null }
})

const emit = defineEmits(['update:search', 'update:continent'])

// El campo `region` de la API usa estos valores (Perú -> "Americas")
const continentes = [
  { label: 'Todos los continentes', value: null },
  { label: 'África', value: 'Africa' },
  { label: 'América', value: 'Americas' },
  { label: 'Asia', value: 'Asia' },
  { label: 'Europa', value: 'Europe' },
  { label: 'Oceanía', value: 'Oceania' }
]
</script>
