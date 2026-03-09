<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const isOpen = ref(false)

const WHATSAPP_NUMBER = '5215535501265'

const questions = computed(() => [
  t('whatsapp.question1'),
  t('whatsapp.question2'),
  t('whatsapp.question3'),
  t('whatsapp.question4'),
  t('whatsapp.question5')
])

function openWhatsApp(message = '') {
  const text = encodeURIComponent(message.trim())
  const url = text
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
    : `https://wa.me/${WHATSAPP_NUMBER}`
  window.open(url, '_blank', 'noopener,noreferrer')
  isOpen.value = false
}
</script>

<template>
  <div class="whatsapp-float">
    <Transition name="whatsapp-pop">
      <div v-if="isOpen" class="whatsapp-panel">
        <span class="whatsapp-panel__title">{{ t('whatsapp.title') }}</span>
        <button
          v-for="(q, i) in questions"
          :key="i"
          type="button"
          class="whatsapp-panel__item"
          @click="openWhatsApp(q)"
        >
          {{ q }}
        </button>
        <button
          type="button"
          class="whatsapp-panel__item whatsapp-panel__item--direct"
          @click="openWhatsApp(t('whatsapp.reservation'))"
        >
          {{ t('whatsapp.reserveNow') }}
        </button>
      </div>
    </Transition>
    <button
      type="button"
      class="whatsapp-btn"
      :class="{ 'whatsapp-btn--open': isOpen }"
      :aria-label="t('whatsapp.ariaLabel')"
      @click="isOpen = !isOpen"
    >
      <svg v-if="!isOpen" viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span v-else class="whatsapp-btn__close">×</span>
    </button>
  </div>
</template>

<style scoped>
.whatsapp-float {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}

.whatsapp-panel {
  background: #fff;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1);
  max-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.whatsapp-panel__title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.whatsapp-panel__item {
  background: #f8fafc;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: var(--color-text);
  text-align: left;
  cursor: pointer;
  transition: all 0.25s ease;
}

.whatsapp-panel__item:hover {
  background: rgba(214, 151, 49, 0.1);
  border-color: rgba(214, 151, 49, 0.35);
  color: rgb(180, 120, 30);
}

.whatsapp-panel__item--direct {
  background: var(--color-primary);
  color: #fff;
  border: none;
  font-weight: 600;
  text-align: center;
}

.whatsapp-panel__item--direct:hover {
  background: var(--color-primary-dark);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(214, 151, 49, 0.35);
}

.whatsapp-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(214, 151, 49, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.whatsapp-btn:hover {
  background: var(--color-primary-dark);
  transform: scale(1.08);
  box-shadow: 0 6px 28px rgba(214, 151, 49, 0.5);
}

.whatsapp-btn:active {
  transform: scale(0.96);
}

.whatsapp-btn__close {
  font-size: 1.8rem;
  line-height: 1;
  font-weight: 300;
}

.whatsapp-pop-enter-active,
.whatsapp-pop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.whatsapp-pop-enter-from,
.whatsapp-pop-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
</style>
