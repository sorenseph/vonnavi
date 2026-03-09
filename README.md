# Von Navi - Vuelo en Globo Teotihuacán

Sitio web de Von Navi para reservaciones y cotizaciones de vuelos en globo sobre Teotihuacán. Desarrollado con Vue 3, Vite y Supabase.

## Características

- **Landing page** inspirada en vonnavi.com.mx con diseño moderno
- **Paquetes de vuelo** dinámicos desde Supabase (Básico, Desayuno, Gold, Plus)
- **Sistema de cotizaciones** con servicios extra, código promocional y cálculo de total
- **Reservaciones** con selección de fecha, paquete y pasajeros
- **Panel de administración** (requiere login) para ver:
  - Cotizaciones y cambiar estado
  - Reservaciones y cambiar estado
  - Paquetes
  - Promociones
- **SEO** optimizado con meta tags dinámicos por página
- **Login** con 2 usuarios de prueba (crear en Supabase Dashboard)

## Requisitos

- Node.js 18+
- Cuenta Supabase

## Instalación

```bash
# Instalar dependencias
npm install

# Crear archivo .env (o usar el existente con tus credenciales)
cp .env.example .env
# Edita .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
```

## Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. En **SQL Editor**, ejecuta el contenido de `supabase/setup-completo.sql` (crea tablas + paquetes en un solo paso)
3. Crea los usuarios admin siguiendo `supabase/seed-users.md` (admin@vonnavi.com / Admin123, ventas@vonnavi.com / Ventas123)
4. En **Authentication** → **Providers**, habilita Email si no está activo

### Error 404 en paquetes

Si obtienes 404 al cargar paquetes, las tablas no existen. Ejecuta `setup-completo.sql` en SQL Editor. Ver `supabase/TROUBLESHOOTING.md` para más detalles.

## Desarrollo

```bash
npm run dev
```

Abre http://localhost:5173

## Build

```bash
npm run build
npm run preview  # para previsualizar el build
```

## Estructura del proyecto

```
src/
├── assets/
│   └── images/           # Imágenes propias (logo, paquetes, servicios)
│       ├── paquetes/     # paquetes-vista.png, etc.
│       └── servicios/
├── components/           # AppHeader, AppFooter, LanguageSwitcher
├── composables/          # useSeo, useScrollReveal
├── i18n/                 # Traducciones ES, EN, FR, PT
├── lib/                  # supabase client
├── router/
├── views/
├── App.vue
└── main.js

public/
├── images/
│   ├── paquetes/        # Imágenes de paquetes (desayuno.svg, plus.svg, etc.)
│   ├── servicios/       # Iconos servicios (champagne.svg, etc.)
│   └── hero/            # Imagen hero/background
└── logo.svg
```

### Agregar imágenes de paquetes

1. Coloca tus imágenes en `public/images/paquetes/` (ej: `mi-paquete.jpg`)
2. En el panel Admin → Paquetes → Agregar paquete, usa la URL: `/images/paquetes/mi-paquete.jpg`
3. Los 4 paquetes iniciales ya tienen imágenes SVG por defecto

## Usuarios de prueba

Tras crear los usuarios en Supabase Dashboard (ver `supabase/seed-users.md`):

- **admin@vonnavi.com** / **Admin123!**
- **ventas@vonnavi.com** / **Ventas123!**

## Licencia

Proyecto privado - Von Navi / Grupo Raydo
