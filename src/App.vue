<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, provide } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import WhatsAppButton from './components/WhatsAppButton.vue'
import LoaderSpinner from './components/LoaderSpinner.vue'
import ReservarModal from './components/ReservarModal.vue'

const route = useRoute()
const showWhatsApp = computed(() => !route.meta.requiresAuth)
const pageLoading = ref(true)

const reservarModalOpen = ref(false)
const reservarModalParams = ref({})

function openReservarModal(params = {}) {
  reservarModalParams.value = { ...params }
  reservarModalOpen.value = true
}

function closeReservarModal() {
  reservarModalOpen.value = false
  reservarModalParams.value = {}
}

provide('reservarModal', {
  isOpen: reservarModalOpen,
  initialParams: reservarModalParams,
  open: openReservarModal,
  close: closeReservarModal
})

function onOpenReservar(e) {
  openReservarModal(e.detail || {})
}

onMounted(async () => {
  window.addEventListener('vonnavi-open-reservar', onOpenReservar)
  await nextTick()
  requestAnimationFrame(() => {
    setTimeout(() => { pageLoading.value = false }, 400)
  })
})

onUnmounted(() => {
  window.removeEventListener('vonnavi-open-reservar', onOpenReservar)
})
</script>

<template>
  <div class="app">
    <Transition name="page-loader">
      <div v-if="pageLoading" class="page-loader">
        <LoaderSpinner />
      </div>
    </Transition>
    <AppHeader />
    <main class="main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter />
    <ReservarModal />
    <WhatsAppButton v-if="showWhatsApp" />
  </div>
</template>

<style>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main {
  flex: 1;
  padding-top: 80px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page-loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg, #fff);
}

.page-loader-leave-active {
  transition: opacity 0.35s ease;
}
.page-loader-leave-to {
  opacity: 0;
}
</style>
