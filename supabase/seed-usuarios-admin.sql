-- Crear 2 usuarios admin genéricos en Supabase
-- Ejecutar en SQL Editor DESPUÉS de que las tablas existan
-- Requiere: CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- NOTA: La forma más sencilla es crear usuarios desde el Dashboard:
-- Supabase → Authentication → Users → Add user → Create new user
--
-- Usuarios recomendados:
-- 1. admin@vonnavi.com  /  Admin123
-- 2. ventas@vonnavi.com /  Ventas123
--
-- Si prefieres usuarios más genéricos:
-- 1. admin@test.com  /  admin123
-- 2. admin2@test.com /  admin123

-- Alternativa vía SQL (puede variar según versión de Supabase):
/*
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_id1 UUID := gen_random_uuid();
  v_id2 UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES 
    (v_id1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@vonnavi.com', crypt('Admin123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
    (v_id2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ventas@vonnavi.com', crypt('Ventas123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
  VALUES 
    (v_id1, v_id1, jsonb_build_object('sub', v_id1::text, 'email', 'admin@vonnavi.com'), 'email', v_id1::text, NOW(), NOW()),
    (v_id2, v_id2, jsonb_build_object('sub', v_id2::text, 'email', 'ventas@vonnavi.com'), 'email', v_id2::text, NOW(), NOW());
END $$;
*/
