<!--
  CurrencyDialog.vue  —  RESPONSABLE: Gabriela
  Modal de moneda (se usa en el listado y en el detalle).

  v-model   (Boolean)      -> abierto / cerrado
  Props:    currency (Object|null) -> { code, name, symbol }

  Muestra:
   - Nombre, código y símbolo
   - Tasa actual frente a USD                    -> tasa(code)
   - Conversor: monto + botón "Convertir a USD"  -> convertir(code, 'USD', monto)
   - Estados de carga (q-spinner / :loading) y de error (q-banner / Notify)
-->
<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="val => emit('update:modelValue', val)"
    @show="cargarTasa"
    @hide="limpiar"
  >
    <q-card style="width: 380px; max-width: 92vw">
      <!-- 1. Nombre, código y símbolo -->
      <q-card-section class="row items-start no-wrap">
        <div>
          <div class="text-h6">{{ currency?.name ?? 'Moneda' }}</div>
          <div class="text-grey-7">
            <span class="text-weight-bold">{{ currency?.code }}</span>
            <span v-if="currency?.symbol"> · símbolo {{ currency.symbol }}</span>
          </div>
        </div>
        <q-space />
        <q-btn v-close-popup icon="close" flat round dense aria-label="Cerrar" />
      </q-card-section>

      <q-separator />

      <!-- 2. Tasa frente al dólar -->
      <q-card-section>
        <div class="text-caption text-grey-7">Tasa actual frente al dólar</div>

        <div v-if="cargandoTasa" class="row items-center q-gutter-sm q-mt-xs">
          <q-spinner color="primary" size="20px" />
          <span>Consultando tasa…</span>
        </div>

        <q-banner v-else-if="errorTasa" dense rounded class="bg-red-1 text-negative q-mt-xs">
          {{ errorTasa }}
          <template #action>
            <q-btn flat dense no-caps color="negative" label="Reintentar" @click="cargarTasa" />
          </template>
        </q-banner>

        <template v-else-if="tasaUsd !== null">
          <div class="text-h5 text-weight-bold q-mt-xs">
            1 {{ currency.code }} = {{ formatear(tasaUsd) }} USD
          </div>
          <div v-if="fecha" class="text-caption text-grey-6">Actualizada el {{ fecha }}</div>
        </template>
      </q-card-section>

      <q-separator />

      <!-- 3. Conversor -->
      <q-card-section>
        <q-form class="q-gutter-sm" @submit="convertirMonto">
          <q-input
            v-model.number="monto"
            type="number"
            outlined
            dense
            min="0"
            step="any"
            :label="`Monto en ${currency?.code ?? ''}`"
            :prefix="currency?.symbol || ''"
            :rules="[v => (v !== null && v !== '' && v > 0) || 'Ingresa un monto mayor a 0']"
            lazy-rules
          />
          <q-btn
            type="submit"
            color="primary"
            no-caps
            class="full-width"
            label="Convertir a USD"
            :loading="convirtiendo"
            :disable="!currency"
          />
        </q-form>

        <div v-if="resultado !== null" class="q-mt-md text-subtitle1">
          {{ formatear(montoConvertido) }} {{ currency.code }} =
          <span class="text-weight-bold">{{ formatear(resultado) }} USD</span>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { tasa, convertir, mensajeDeError } from 'src/services/currencies.js'

defineOptions({ name: 'CurrencyDialog' })

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  currency: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue'])

const $q = useQuasar()

// Estado de la tasa
const tasaUsd = ref(null)
const fecha = ref('')
const cargandoTasa = ref(false)
const errorTasa = ref('')

// Estado del conversor
const monto = ref(null)
const montoConvertido = ref(null)
const resultado = ref(null)
const convirtiendo = ref(false)

const formato = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 4 })
function formatear (numero) {
  return formato.format(numero)
}

// as_of viene en segundos (formato Unix); Date necesita milisegundos
function formatearFecha (asOf) {
  if (!asOf) return ''
  return new Date(asOf * 1000).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Se ejecuta cada vez que el modal se abre (@show)
async function cargarTasa () {
  if (!props.currency?.code) return
  cargandoTasa.value = true
  errorTasa.value = ''
  try {
    const r = await tasa(props.currency.code)
    tasaUsd.value = r.rate
    fecha.value = formatearFecha(r.asOf)
  } catch (error) {
    errorTasa.value = mensajeDeError(error)
  } finally {
    cargandoTasa.value = false
  }
}

async function convertirMonto () {
  if (!(monto.value > 0)) {
    $q.notify({ type: 'warning', message: 'Ingresa un monto mayor a 0' })
    return
  }
  convirtiendo.value = true
  try {
    const r = await convertir(props.currency.code, 'USD', monto.value)
    resultado.value = r.result
    montoConvertido.value = monto.value
  } catch (error) {
    $q.notify({ type: 'negative', message: mensajeDeError(error) })
  } finally {
    convirtiendo.value = false
  }
}

// Al cerrar, se borra todo para que la próxima moneda empiece limpia
function limpiar () {
  tasaUsd.value = null
  fecha.value = ''
  errorTasa.value = ''
  monto.value = null
  montoConvertido.value = null
  resultado.value = null
}
</script>
