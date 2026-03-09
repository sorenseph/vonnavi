<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSeo } from '../composables/useSeo'
import { supabase } from '../lib/supabase'
const { locale } = useI18n()
const route = useRoute()
const post = ref(null)
const loading = ref(true)

const content = computed(() => {
  if (!post.value?.blog_post_i18n) return null
  const i18n = post.value.blog_post_i18n.find(i => i.locale === locale.value)
  return i18n || post.value.blog_post_i18n.find(i => i.locale === 'es') || post.value.blog_post_i18n[0]
})

const metaTitle = computed(() =>
  content.value?.titulo ? `${content.value.titulo} | Von Navi Blog` : 'Blog | Von Navi'
)

useSeo({
  title: metaTitle,
  description: content.value?.cuerpo?.replace(/<[^>]+>/g, '').slice(0, 160) || 'Artículo del blog Von Navi'
})

onMounted(async () => {
  const { data } = await supabase
    .from('blog_posts')
    .select('*, blog_post_i18n(*)')
    .eq('slug', route.params.slug)
    .eq('publicado', true)
    .single()
  post.value = data
  loading.value = false
})
</script>

<template>
  <div class="blog-post section">
    <div class="container" style="max-width: 720px;">
      <div v-if="loading" class="loading">{{ $t('blog.loading') }}</div>

      <div v-else-if="!post" class="error">
        <h2>{{ $t('blog.notFound') }}</h2>
        <router-link to="/blog" class="btn btn-primary">{{ $t('blog.backToBlog') }}</router-link>
      </div>

      <article v-else :key="locale">
        <div v-if="post.imagen_url" class="blog-post__hero" :style="{ backgroundImage: `url(${post.imagen_url})` }"></div>
        <header class="blog-post__header">
          <h1 class="blog-post__title">{{ content?.titulo }}</h1>
          <p class="blog-post__meta">{{ new Date(post.created_at).toLocaleDateString('es-MX') }} · {{ post.autor || 'Von Navi' }}</p>
        </header>
        <div class="blog-post__body prose" v-html="content?.cuerpo"></div>
        <router-link to="/blog" class="btn btn-outline" style="margin-top: 2rem;">← {{ $t('blog.backToBlog') }}</router-link>
      </article>
    </div>
  </div>
</template>

<style scoped>
.blog-post__hero {
  height: 280px;
  border-radius: 16px;
  background-size: cover;
  background-position: center;
  margin-bottom: 2rem;
}

.blog-post__header { margin-bottom: 2rem; }

.blog-post__title {
  font-size: 2rem;
  font-family: 'Outfit', system-ui, sans-serif;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.blog-post__meta {
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.blog-post__body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.blog-post__body :deep(h1),
.blog-post__body :deep(h2),
.blog-post__body :deep(h3) {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.blog-post__body :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.7;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
}
</style>
