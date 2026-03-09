-- Von Navi - Setup completo para Supabase
-- Ejecuta ESTE archivo en el SQL Editor de Supabase (TODO EN UNO)
-- Resuelve el error "relation paquetes does not exist"

-- ========== 1. TABLAS ==========
CREATE TABLE IF NOT EXISTS paquetes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  incluye TEXT[],
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promociones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  codigo TEXT UNIQUE,
  descuento_porcentaje DECIMAL(5,2) DEFAULT 0,
  descuento_monto DECIMAL(10,2) DEFAULT 0,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cotizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio TEXT UNIQUE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  fecha_vuelo DATE,
  num_pasajeros INTEGER DEFAULT 1,
  num_adultos INTEGER DEFAULT 1,
  num_ninos INTEGER DEFAULT 0,
  paquete_id UUID REFERENCES paquetes(id),
  servicios_extra TEXT[],
  mensaje TEXT,
  total_estimado DECIMAL(10,2),
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'contactado', 'confirmada', 'cancelada')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agregar columnas si la tabla ya existía
DO $$ BEGIN
  ALTER TABLE cotizaciones ADD COLUMN num_adultos INTEGER DEFAULT 1;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE cotizaciones ADD COLUMN num_ninos INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE cotizaciones ADD COLUMN paquete_slug TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS reservaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio TEXT UNIQUE,
  cotizacion_id UUID REFERENCES cotizaciones(id),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  fecha_vuelo DATE NOT NULL,
  num_pasajeros INTEGER NOT NULL DEFAULT 1,
  paquete_id UUID REFERENCES paquetes(id),
  total DECIMAL(10,2) NOT NULL,
  promocion_id UUID REFERENCES promociones(id),
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'pagada', 'completada', 'cancelada')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========== 2. RLS ==========
ALTER TABLE paquetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promociones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Paquetes públicos" ON paquetes;
DROP POLICY IF EXISTS "Promociones públicas" ON promociones;
DROP POLICY IF EXISTS "Crear cotizaciones" ON cotizaciones;
DROP POLICY IF EXISTS "Crear reservaciones" ON reservaciones;
DROP POLICY IF EXISTS "Admin cotizaciones" ON cotizaciones;
DROP POLICY IF EXISTS "Admin reservaciones" ON reservaciones;
DROP POLICY IF EXISTS "Admin paquetes" ON paquetes;
DROP POLICY IF EXISTS "Admin promociones" ON promociones;

CREATE POLICY "Paquetes públicos" ON paquetes FOR SELECT USING (activo = true);
CREATE POLICY "Promociones públicas" ON promociones FOR SELECT USING (activo = true AND fecha_fin >= CURRENT_DATE);
CREATE POLICY "Crear cotizaciones" ON cotizaciones FOR INSERT WITH CHECK (true);
CREATE POLICY "Crear reservaciones" ON reservaciones FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin cotizaciones" ON cotizaciones FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin reservaciones" ON reservaciones FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin paquetes" ON paquetes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin promociones" ON promociones FOR ALL USING (auth.role() = 'authenticated');

-- ========== 3. PAQUETES ==========
INSERT INTO paquetes (nombre, slug, descripcion, precio, incluye, imagen_url, orden) VALUES
  ('Vuelos Básico', 'basico', 'Vuelo en globo sobre Teotihuacán. Incluye certificado de vuelo.', 2750, ARRAY['Vuelo en globo', 'Certificado de vuelo'], '/images/paquetes/basico.svg', 4),
  ('Paquete Desayuno', 'desayuno', 'Vuelo + desayuno buffet. Vuelos compartidos de 6 a 24 pasajeros.', 2970, ARRAY['Vuelo en globo', 'Desayuno buffet', 'Certificado'], '/images/paquetes/desayuno.svg', 3),
  ('Paquete Gold', 'gold', 'Experiencia premium con desayuno y amenities especiales.', 3355, ARRAY['Vuelo en globo', 'Desayuno premium', 'Champagne', 'Certificado'], '/images/paquetes/gold.svg', 2),
  ('Paquete Plus', 'plus', 'Todo incluido: recogida, vuelo, desayuno, champagne y más.', 4290, ARRAY['Recogida en hotel', 'Vuelo en globo', 'Desayuno', 'Champagne', 'Certificado', 'Fotos'], '/images/paquetes/plus.svg', 1)
ON CONFLICT (slug) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio,
  incluye = EXCLUDED.incluye,
  imagen_url = COALESCE(paquetes.imagen_url, EXCLUDED.imagen_url),
  orden = EXCLUDED.orden,
  updated_at = now();

-- ========== 4. BLOG ==========
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  imagen_url TEXT,
  publicado BOOLEAN DEFAULT false,
  autor TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_post_i18n (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  titulo TEXT NOT NULL,
  cuerpo TEXT NOT NULL,
  UNIQUE(post_id, locale)
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_i18n ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Blog público lectura" ON blog_posts;
DROP POLICY IF EXISTS "Blog admin todo" ON blog_posts;
DROP POLICY IF EXISTS "Blog i18n público" ON blog_post_i18n;
DROP POLICY IF EXISTS "Blog i18n admin" ON blog_post_i18n;

CREATE POLICY "Blog público lectura" ON blog_posts FOR SELECT USING (publicado = true);
CREATE POLICY "Blog admin todo" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Blog i18n público" ON blog_post_i18n FOR SELECT USING (
  EXISTS (SELECT 1 FROM blog_posts p WHERE p.id = post_id AND p.publicado = true)
);
CREATE POLICY "Blog i18n admin" ON blog_post_i18n FOR ALL USING (auth.role() = 'authenticated');
