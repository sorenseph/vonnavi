-- Ejecutar después del schema.sql para tener una promoción de prueba
INSERT INTO promociones (titulo, codigo, descuento_porcentaje, fecha_inicio, fecha_fin) VALUES
  ('Verano 2025', 'VERANO25', 10, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 months');
