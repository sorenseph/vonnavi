-- Ejecutar en Supabase SQL Editor para insertar los paquetes de Von Navi
-- Si ya existen, se actualizarán por slug

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
