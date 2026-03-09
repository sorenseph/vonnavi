<script setup>
import loaderGif from '@/assets/images/newassets/loader.gif'
</script>

<template>
  <div class="loader-spinner">
    <img :src="loaderGif" alt="" class="loader-spinner__gif" />
    <span v-if="$slots.default" class="loader-spinner__text"><slot /></span>
  </div>
</template>

<style scoped>
.loader-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.loader-spinner__gif {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.loader-spinner__text {
  font-size: 0.95rem;
  color: var(--color-text-muted);
}
</style>
