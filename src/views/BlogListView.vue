<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSeo } from '../composables/useSeo'
import { supabase } from '../lib/supabase'
import blogVideoSrc from '@/assets/images/wallpapervideo/6072002_Hot Air Balloon Flame Floating Tourism_By_EMBARA_Footage_Artlist_HD.mp4'

const { t, locale } = useI18n()
const posts = ref([])
const loading = ref(true)

useSeo({
  title: 'Blog | Von Navi - Vuelo en Globo Teotihuacán',
  description: 'Artículos, experiencias y consejos sobre vuelos en globo sobre las pirámides de Teotihuacán.'
})

onMounted(async () => {
  const { data } = await supabase
    .from('blog_posts')
    .select('*, blog_post_i18n(*)')
    .eq('publicado', true)
    .order('created_at', { ascending: false })
  posts.value = data || []
  loading.value = false
})

function getPostContent(post, loc) {
  const i18n = post.blog_post_i18n?.find(i => i.locale === loc)
  return i18n || post.blog_post_i18n?.find(i => i.locale === 'es') || post.blog_post_i18n?.[0]
}
</script>

<template>
  <div class="blog-list section">
    <div class="blog-list__hero-wrap">
      <video class="blog-list__hero-video" autoplay muted loop playsinline>
        <source :src="blogVideoSrc" type="video/mp4" />
      </video>
      <div class="blog-list__hero-overlay"></div>
      <div class="blog-list__hero-content container">
        <h1 class="blog-list__hero-title">{{ t('blog.title') }}</h1>
        <p class="blog-list__hero-subtitle">{{ t('blog.subtitle') }}</p>
      </div>
    </div>
    <div class="container">

      <div v-if="loading" class="loading">{{ t('blog.loading') }}</div>

      <div v-else-if="!posts.length" class="empty">
        <p>{{ t('blog.noPosts') }}</p>
      </div>

      <div v-else class="blog-grid" :key="locale">
        <router-link
          v-for="post in posts"
          :key="post.id"
          :to="`/blog/${post.slug}`"
          class="blog-card"
        >
          <div v-if="post.imagen_url" class="blog-card__img" :style="{ backgroundImage: `url(${post.imagen_url})` }"></div>
          <div v-else class="blog-card__img blog-card__img--placeholder"></div>
          <div class="blog-card__body">
            <h3 class="blog-card__title">{{ getPostContent(post, locale)?.titulo || post.slug }}</h3>
            <p class="blog-card__excerpt">{{ getPostContent(post, locale)?.cuerpo?.replace(/<[^>]+>/g, '').slice(0, 120) }}...</p>
            <span class="blog-card__date">{{ new Date(post.created_at).toLocaleDateString('es-MX') }}</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-list__hero-wrap {
  position: relative;
  width: 100%;
  min-height: 320px;
  display: flex;
  align-items: flex-end;
  margin-bottom: 2rem;
  overflow: hidden;
}

.blog-list__hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog-list__hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(248,245,240,0.85) 50%, var(--color-bg) 100%);
  pointer-events: none;
}

.blog-list__hero-content {
  position: relative;
  z-index: 1;
  padding-bottom: 2rem;
}

.blog-list__hero-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-family: 'Outfit', system-ui, sans-serif;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.blog-list__hero-subtitle {
  font-size: 1.1rem;
  font-family: 'Outfit', system-ui, sans-serif;
  color: #444;
  max-width: 600px;
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.blog-card {
  display: block;
  text-decoration: none;
  border-radius: 16px;
  overflow: hidden;
  background: var(--color-bg-card);
  border: 1px solid rgba(0,0,0,0.08);
  transition: all 0.3s;
}

.blog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.12);
}

.blog-card__img {
  height: 180px;
  background-size: cover;
  background-position: center;
}

.blog-card__img--placeholder {
  background: var(--color-primary);
  opacity: 0.5;
}

.blog-card__body { padding: 1.25rem; }

.blog-card__title {
  font-size: 1.25rem;
  font-family: 'Outfit', system-ui, sans-serif;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.blog-card__excerpt {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-card__date {
  font-size: 0.8rem;
  color: var(--color-primary);
}

.loading, .empty {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
}

</style>
