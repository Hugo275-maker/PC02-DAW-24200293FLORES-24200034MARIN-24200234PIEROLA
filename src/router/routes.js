const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // Pantalla 1: listado
      { path: '', name: 'countries', component: () => import('pages/CountriesPage.vue') },
      // Pantalla 2: detalle (reemplaza el listado, no es ventana aparte)
      { path: 'country/:code', name: 'country-detail', component: () => import('pages/CountryDetailPage.vue'), props: true }
    ]
  },
  // Cualquier otra ruta vuelve al listado
  { path: '/:catchAll(.*)*', redirect: '/' }
]

export default routes
