/**
 * Paquetes de vuelo estáticos - Von Navi
 * Precios y datos de https://vonnavi.com.mx/paquetes
 */
export const paquetesEstaticos = [
  {
    id: 'basico',
    nombre: 'Vuelos Básico',
    slug: 'basico',
    descripcion: 'Vuelo en globo sobre Teotihuacán. Incluye certificado de vuelo.',
    precio: 2750,
    incluye: ['Vuelo en globo', 'Certificado de vuelo'],
    orden: 4
  },
  {
    id: 'desayuno',
    nombre: 'Paquete Desayuno',
    slug: 'desayuno',
    descripcion: 'Vuelo + desayuno buffet. Vuelos compartidos de 6 a 24 pasajeros.',
    precio: 2970,
    incluye: ['Vuelo en globo', 'Desayuno buffet', 'Certificado'],
    orden: 3
  },
  {
    id: 'gold',
    nombre: 'Paquete Gold',
    slug: 'gold',
    descripcion: 'Experiencia premium con desayuno y amenities especiales.',
    precio: 3355,
    incluye: ['Vuelo en globo', 'Desayuno premium', 'Champagne', 'Certificado'],
    orden: 2
  },
  {
    id: 'plus',
    nombre: 'Paquete Plus',
    slug: 'plus',
    descripcion: 'Coffe break, vuelo 45-60 min, seguro de viajero, certificado, brindis con vino espumoso, desayuno buffet, transporte redondo PRIVADO (1-4 personas).',
    precio: 4290,
    incluye: [
      'Coffe break',
      'Vuelo con duración de 45 a 60 min aproximadamente',
      'Seguro de viajero',
      'Certificado de vuelo',
      'Brindis con vino espumoso',
      'Desayuno Buffet',
      'Transporte redondo PRIVADO (1 a 4 personas)'
    ],
    orden: 1
  }
].sort((a, b) => a.orden - b.orden)
