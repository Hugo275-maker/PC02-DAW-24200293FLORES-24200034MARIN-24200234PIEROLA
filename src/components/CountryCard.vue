<!--
  CountryCard.vue  —  RESPONSABLE: Ana
  Tarjeta de un país en el listado.

  Props:  country (Object)  -> un país tal como lo devuelve services/countries.js
  Emits:  'select'   (code)      -> al tocar la tarjeta (ir al detalle)
          'currency' (currency)  -> al tocar el chip de moneda (abrir CurrencyDialog)

  Debe mostrar: bandera (https://flagcdn.com/w160/{alpha2}.png), nombre, capital,
  población, continente y la moneda como q-chip.
  OJO: en el chip usar @click.stop para que no dispare también 'select'.
-->
<template>
  <q-card class="cursor-pointer" @click="emit('select', country?.code)">
    <q-card-section>
      <!-- TODO (Ana): diseño de la tarjeta -->
      <div class="text-subtitle1">{{ country?.name ?? 'País' }}</div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineOptions({ name: 'CountryCard' })

defineProps({
  country: { type: Object, required: true }
})

const emit = defineEmits(['select', 'currency'])
</script>
