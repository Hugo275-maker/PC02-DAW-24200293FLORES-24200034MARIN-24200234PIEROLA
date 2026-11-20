<!--
  MainLayout.vue  —  estilos: Ana
  Cabecera con el nombre de la app (lleva al listado) y contenido centrado con ancho máximo.
-->
<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="app-shell">
        <q-icon name="public" size="28px" />
        <q-toolbar-title>
          <router-link :to="{ name: 'countries' }" class="brand">Country Explorer</router-link>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <div class="app-shell">
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
defineOptions({ name: 'MainLayout' })
</script>

<style scoped>
.app-shell {
  max-width: 1240px;
  margin: 0 auto;
}
.brand {
  color: inherit;
  text-decoration: none;
}
.brand:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
  border-radius: 4px;
}
</style>
