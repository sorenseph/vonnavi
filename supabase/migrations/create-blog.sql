-- Blog: posts con soporte multiidioma
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  imagen_url TEXT,
  publicado BOOLEAN DEFAULT false,
  autor TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contenido por idioma: titulo y cuerpo (HTML rich text)
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

CREATE POLICY "Blog público lectura" ON blog_posts FOR SELECT USING (publicado = true);
CREATE POLICY "Blog admin todo" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Blog i18n público" ON blog_post_i18n FOR SELECT USING (
  EXISTS (SELECT 1 FROM blog_posts p WHERE p.id = post_id AND p.publicado = true)
);
CREATE POLICY "Blog i18n admin" ON blog_post_i18n FOR ALL USING (auth.role() = 'authenticated');
