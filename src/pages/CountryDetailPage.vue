<!--
  CountryDetailPage.vue  —  Pantalla 2 (ruta /country/:code)  —  RESPONSABLE: Ana
  - Recibe `code` por props (ver router/routes.js) y llama porCodigo(code)
  - Muestra: bandera grande (w320), nombre, continente, capital destacada,
    población, área, idiomas, zona horaria, código telefónico, dominio,
    lado de conducción, países fronterizos (chips; al tocar -> ir a ese país)
  - Al tocar la moneda -> <CurrencyDialog>
  - Estados de carga y error
  - OJO: watch(() => props.code) para recargar al navegar entre países fronterizos
-->
<template>
  <q-page padding>
    <q-btn flat no-caps icon="chevron_left" label="Volver al listado" :to="{ name: 'countries' }" class="q-mb-md" />

    <q-card>
      <q-card-section>
        <!-- TODO (Ana): detalle del país -->
        <div class="text-h5">{{ code }}</div>
      </q-card-section>
    </q-card>

    <CurrencyDialog v-model="showCurrency" :currency="selectedCurrency" />
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import CurrencyDialog from 'components/CurrencyDialog.vue'

defineOptions({ name: 'CountryDetailPage' })

defineProps({
  code: { type: String, required: true }
})

const showCurrency = ref(false)
const selectedCurrency = ref(null)
</script>
