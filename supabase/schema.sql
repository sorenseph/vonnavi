-- Von Navi - Esquema de base de datos
-- Ejecutar en Supabase SQL Editor

-- Paquetes de vuelo
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

-- Promociones
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

-- Cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio TEXT UNIQUE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  fecha_vuelo DATE,
  num_pasajeros INTEGER DEFAULT 1,
  paquete_id UUID REFERENCES paquetes(id),
  servicios_extra TEXT[],
  mensaje TEXT,
  total_estimado DECIMAL(10,2),
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'contactado', 'confirmada', 'cancelada')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Reservaciones
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

-- Usuarios admin (custom - para panel sin Supabase Auth completo)
-- Usaremos auth.users de Supabase para login
-- Los 2 usuarios de prueba se crean via Supabase Dashboard o SQL:
-- INSERT INTO auth.users (...) -- mejor usar la UI de Supabase

-- RLS Policies
ALTER TABLE paquetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promociones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservaciones ENABLE ROW LEVEL SECURITY;

-- Lectura pública para paquetes y promociones activas
CREATE POLICY "Paquetes públicos" ON paquetes FOR SELECT USING (activo = true);
CREATE POLICY "Promociones públicas" ON promociones FOR SELECT USING (activo = true AND fecha_fin >= CURRENT_DATE);

-- Cualquiera puede crear cotizaciones
CREATE POLICY "Crear cotizaciones" ON cotizaciones FOR INSERT WITH CHECK (true);
CREATE POLICY "Crear reservaciones" ON reservaciones FOR INSERT WITH CHECK (true);

-- Admin puede ver todo (usaremos service role para el panel admin desde backend si es necesario)
-- Por ahora permitimos SELECT con auth para usuarios autenticados
CREATE POLICY "Admin cotizaciones" ON cotizaciones FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin reservaciones" ON reservaciones FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin paquetes" ON paquetes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin promociones" ON promociones FOR ALL USING (auth.role() = 'authenticated');

-- Función para generar folio
CREATE OR REPLACE FUNCTION generar_folio(prefix TEXT)
RETURNS TEXT AS $$
DECLARE
  nuevo_folio TEXT;
  existe BOOLEAN;
BEGIN
  LOOP
    nuevo_folio := prefix || '-' || TO_CHAR(now(), 'YYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 6));
    SELECT EXISTS(SELECT 1 FROM cotizaciones WHERE folio = nuevo_folio) INTO existe;
    IF NOT existe THEN
      RETURN nuevo_folio;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insertar paquetes iniciales (ejecutar después de crear tablas)
-- Los 4 paquetes por defecto; los demás los agrega el usuario desde el panel admin
INSERT INTO paquetes (nombre, slug, descripcion, precio, incluye, imagen_url, orden) VALUES
  ('Vuelos Básico', 'basico', 'Vuelo en globo sobre Teotihuacán. Incluye certificado de vuelo.', 2750, ARRAY['Vuelo en globo', 'Certificado de vuelo'], '/images/paquetes/basico.svg', 4),
  ('Paquete Desayuno', 'desayuno', 'Vuelo + desayuno buffet. Vuelos compartidos de 6 a 24 pasajeros.', 2970, ARRAY['Vuelo en globo', 'Desayuno buffet', 'Certificado'], '/images/paquetes/desayuno.svg', 3),
  ('Paquete Gold', 'gold', 'Experiencia premium con desayuno y amenities especiales.', 3355, ARRAY['Vuelo en globo', 'Desayuno premium', 'Champagne', 'Certificado'], '/images/paquetes/gold.svg', 2),
  ('Paquete Plus', 'plus', 'Todo incluido: recogida, vuelo, desayuno, champagne y más.', 4290, ARRAY['Recogida en hotel', 'Vuelo en globo', 'Desayuno', 'Champagne', 'Certificado', 'Fotos'], '/images/paquetes/plus.svg', 1)
ON CONFLICT (slug) DO UPDATE SET
  descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio,
  imagen_url = COALESCE(paquetes.imagen_url, EXCLUDED.imagen_url),
  incluye = EXCLUDED.incluye;

-- Promoción de ejemplo (opcional)
-- INSERT INTO promociones (titulo, codigo, descuento_porcentaje, fecha_inicio, fecha_fin) VALUES
--   ('Verano 2025', 'VERANO25', 10, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 months');
