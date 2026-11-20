<!--
  FlagImage.vue  —  RESPONSABLE: Ana
  Bandera desde flagcdn.com: https://flagcdn.com/{w80|w160|w320}/{alpha2}.png
  Si la imagen falla, muestra el código del país.
-->
<template>
  <div class="flag" :style="boxStyle">
    <img v-if="code && !failed" :src="src" :alt="alt" loading="lazy" @error="failed = true">
    <span v-else class="flag__fallback">{{ code.toUpperCase() }}</span>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

defineOptions({ name: 'FlagImage' })

const props = defineProps({
  code: { type: String, default: '' }, // ISO alpha-2
  size: { type: String, default: 'w160' }, // w80 | w160 | w320
  width: { type: Number, default: 44 },
  alt: { type: String, default: '' } // vacío = decorativa (el nombre ya está al lado)
})

const failed = ref(false)
watch(() => props.code, () => { failed.value = false })

const src = computed(() => `https://flagcdn.com/${props.size}/${props.code.toLowerCase()}.png`)
const boxStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${Math.round(props.width * 0.7)}px`
}))
</script>

<style scoped>
.flag {
  flex: none;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 4px;
  background: #f6f7f9;
  border: 1px solid #e3e6ea;
}
.flag img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.flag__fallback {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7684;
}
</style>
