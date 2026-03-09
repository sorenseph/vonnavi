import { useHead } from '@unhead/vue'

export function useSeo(options = {}) {
  const {
    title = 'Von Navi - Vuelo en Globo Teotihuacán',
    description = 'Vive la experiencia más emocionante: vuelo en globo aerostático sobre las pirámides de Teotihuacán. Reserva ahora con los mejores precios.',
    image = '/og-image.jpg',
    url = typeof window !== 'undefined' ? window.location.href : ''
  } = options

  useHead({
    title,
    meta: [
      {
        name: 'description',
        content: description
      },
      {
        property: 'og:title',
        content: title
      },
      {
        property: 'og:description',
        content: description
      },
      {
        property: 'og:image',
        content: image.startsWith('http') ? image : `${typeof window !== 'undefined' ? window.location.origin : ''}${image}`
      },
      {
        property: 'og:url',
        content: url
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image'
      },
      {
        name: 'twitter:title',
        content: title
      },
      {
        name: 'twitter:description',
        content: description
      }
    ],
    link: [
      {
        rel: 'canonical',
        href: url
      }
    ]
  })
}
