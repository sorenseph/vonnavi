<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, provide, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import WhatsAppButton from './components/WhatsAppButton.vue'
import LoaderSpinner from './components/LoaderSpinner.vue'
import ReservarModal from './components/ReservarModal.vue'
import { aditamentos } from '@/data/aditamentos'

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

const CART_STORAGE_KEY = 'vonnavi_cart_v1'
function safeParseCart(raw) {
  try {
    const parsed = JSON.parse(raw || 'null')
    if (!parsed || typeof parsed !== 'object') return null
    if (!Array.isArray(parsed.items)) return null
    return { items: parsed.items }
  } catch (_) {
    return null
  }
}

const cartItems = ref([])
const initialCart = safeParseCart(localStorage.getItem(CART_STORAGE_KEY))
if (initialCart) cartItems.value = initialCart.items

function persistCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: cartItems.value }))
}

watch(cartItems, persistCart, { deep: true })

function normalizeAddons(addons) {
  const base = {}
  for (const a of aditamentos) base[a.key] = false
  if (addons && typeof addons === 'object') {
    for (const k of Object.keys(base)) {
      if (addons[k] === true) base[k] = true
    }
  }
  return base
}

function addPackage(pkg, { qty = 1 } = {}) {
  if (!pkg) return
  const slug = pkg.slug || pkg.id
  const existing = cartItems.value.find(x => x.slug === slug)
  if (existing) {
    existing.qty = Math.min(20, (Number(existing.qty) || 0) + (Number(qty) || 1))
    return
  }
  cartItems.value.push({
    slug,
    nombre: pkg.nombre,
    precio: Number(pkg.precio) || 0,
    qty: Math.min(20, Math.max(1, Number(qty) || 1)),
    addons: normalizeAddons()
  })
}

function removeItem(slug) {
  cartItems.value = cartItems.value.filter(x => x.slug !== slug)
}

function setQty(slug, qty) {
  const it = cartItems.value.find(x => x.slug === slug)
  if (!it) return
  const q = Math.min(20, Math.max(1, Number(qty) || 1))
  it.qty = q
}

function toggleAddon(slug, addonKey) {
  const it = cartItems.value.find(x => x.slug === slug)
  if (!it) return
  it.addons = normalizeAddons(it.addons)
  if (Object.prototype.hasOwnProperty.call(it.addons, addonKey)) {
    it.addons[addonKey] = !it.addons[addonKey]
  }
}

function clearCart() {
  cartItems.value = []
}

const subtotal = computed(() =>
  cartItems.value.reduce((acc, it) => acc + (Number(it.precio) || 0) * (Number(it.qty) || 0), 0)
)

const addonsTotal = computed(() => {
  const priceByKey = Object.fromEntries(aditamentos.map(a => [a.key, Number(a.precio) || 0]))
  return cartItems.value.reduce((acc, it) => {
    const qty = Number(it.qty) || 0
    const addons = normalizeAddons(it.addons)
    const addonSum = Object.keys(addons).reduce((aAcc, k) => aAcc + (addons[k] ? (priceByKey[k] || 0) : 0), 0)
    return acc + addonSum * qty
  }, 0)
})

const total = computed(() => subtotal.value + addonsTotal.value)

provide('cart', {
  items: cartItems,
  aditamentos,
  addPackage,
  removeItem,
  setQty,
  toggleAddon,
  clearCart,
  subtotal,
  addonsTotal,
  total
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
