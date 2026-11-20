// Configuración de Quasar (app-vite v2)
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file
import { defineConfig } from '#q-app/wrappers'

export default defineConfig(() => {
  return {
    boot: ['axios'],

    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons'],

    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20'
      },
      vueRouterMode: 'hash'
    },

    devServer: {
      open: true
    },

    framework: {
      config: {},
      plugins: ['Notify', 'Loading']
    },

    animations: []
  }
})
