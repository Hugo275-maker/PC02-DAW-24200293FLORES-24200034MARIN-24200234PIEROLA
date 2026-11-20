<!--
  CurrencyDialog.vue  —  RESPONSABLE: Gabriela
  Modal de moneda (se usa en el listado y en el detalle).

  v-model   (Boolean)      -> abierto / cerrado
  Props:    currency (Object|null) -> { code, name, symbol }

  Debe mostrar:
   - Nombre, código y símbolo
   - Tasa actual frente a USD           -> services/currencies.js  tasa(code)
   - Conversor: monto + botón "Convertir a USD" -> convertir(code, 'USD', monto)
   - Estados de carga (q-spinner / :loading) y de error (q-banner / Notify)
-->
<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => emit('update:modelValue', val)">
    <q-card style="min-width: 340px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ currency?.name ?? 'Moneda' }}</div>
        <q-space />
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-card-section>
        <!-- TODO (Gabriela): tasa vs USD + conversor -->
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineOptions({ name: 'CurrencyDialog' })

defineProps({
  modelValue: { type: Boolean, default: false },
  currency: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue'])
</script>
