// ------------------------------------------------------------------
// utils/errors.js  —  Convierte un error de axios en un mensaje para el usuario.
// Lo usan el detalle (Ana) y el modal de moneda (Gabriela); sirve también para el listado.
// ------------------------------------------------------------------
export function mensajeDeError (err) {
  const status = err?.response?.status
  const apiMessage = err?.response?.data?.errors?.[0]?.message

  if (!err?.response) {
    return 'No se pudo conectar con la API. Revisa tu conexión y que tu API key permita este origen (CORS).'
  }
  switch (true) {
    case status === 400:
      return apiMessage || 'La solicitud no es válida.'
    case status === 401:
      return 'La API key no es válida o expiró. Revisa VITE_API_KEY en tu archivo .env.'
    case status === 403:
      return 'La API rechazó la solicitud (403): quizá se agotaron las 1000 solicitudes del mes o este origen no está permitido en tu key.'
    case status === 404:
      return 'No se encontró lo que buscabas.'
    case status === 429:
      return 'Demasiadas solicitudes seguidas. Espera unos segundos e inténtalo de nuevo.'
    case status >= 500:
      return 'El servicio no está disponible por ahora. Inténtalo de nuevo en unos minutos.'
    default:
      return apiMessage || `Error inesperado (${status}).`
  }
}
