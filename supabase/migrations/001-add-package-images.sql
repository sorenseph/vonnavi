-- Actualizar paquetes existentes con URLs de imagen
-- Los 4 paquetes por defecto usan imágenes en /images/paquetes/
-- Paquetes adicionales agregados por usuarios pueden tener imagen_url null o su propia URL

UPDATE paquetes SET imagen_url = '/images/paquetes/desayuno.svg' WHERE slug = 'desayuno';
UPDATE paquetes SET imagen_url = '/images/paquetes/plus.svg' WHERE slug = 'plus';
UPDATE paquetes SET imagen_url = '/images/paquetes/gold.svg' WHERE slug = 'gold';
UPDATE paquetes SET imagen_url = '/images/paquetes/basico.svg' WHERE slug = 'basico';
