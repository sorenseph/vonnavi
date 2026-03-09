-- Migración: agregar paquete_slug a cotizaciones para paquetes estáticos
-- Ejecutar si ya corriste setup-completo.sql antes
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS paquete_slug TEXT;
