<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCart } from '@/composables/useCart'
import { paquetesEstaticos } from '@/data/paquetes'
import { usePackageI18n } from '@/composables/usePackageI18n'
import { useSeo } from '@/composables/useSeo'

const { t } = useI18n()
const router = useRouter()
const { getPackageName } = usePackageI18n()
const cart = useCart()

useSeo({
  title: 'Carrito | Von Navi',
  description: 'Revisa tus paquetes, agrega aditamentos y procede al pago.'
})

const items = computed(() => cart.items.value || [])

function getPkgBySlug(slug) {
  return paquetesEstaticos.find(p => p.slug === slug) || null
}

function itemDisplayName(item) {
  const pkg = getPkgBySlug(item.slug)
  return pkg ? getPackageName(pkg) : (item.nombre || item.slug)
}

function formatMoney(n) {
  return `$${Number(n || 0).toLocaleString('es-MX')}`
}

function proceedToCheckout() {
  router.push('/checkout')
}
</script>

<template>
  <div class="section section-bg-pattern">
    <div class="container cart">
      <div class="cart__header">
        <div>
          <h1 class="section-title">Carrito</h1>
          <p class="section-subtitle">Paquetes seleccionados, aditamentos y total.</p>
        </div>
        <router-link to="/paquetes" class="btn btn-outline">Seguir explorando</router-link>
      </div>

      <div v-if="!items.length" class="cart-empty">
        <h3>Tu carrito está vacío</h3>
        <p>Explora los paquetes y agrega el que más te guste.</p>
        <router-link to="/paquetes" class="btn btn-primary">Ver paquetes</router-link>
      </div>

      <div v-else class="cart__grid">
        <div class="cart__items">
          <div v-for="it in items" :key="it.slug" class="cart-item">
            <div class="cart-item__main">
              <div class="cart-item__title">
                <h3>{{ itemDisplayName(it) }}</h3>
                <p class="cart-item__price">{{ formatMoney(it.precio) }} <span class="cart-item__muted">por persona</span></p>
              </div>
              <button type="button" class="cart-item__remove" @click="cart.removeItem(it.slug)">Quitar</button>
            </div>

            <div class="cart-item__controls">
              <div class="qty">
                <span class="qty__label">Cantidad</span>
                <div class="qty__box">
                  <button type="button" class="qty__btn" @click="cart.setQty(it.slug, (Number(it.qty) || 1) - 1)">−</button>
                  <input
                    class="qty__input"
                    :value="it.qty"
                    inputmode="numeric"
                    @input="cart.setQty(it.slug, $event.target.value)"
                  />
                  <button type="button" class="qty__btn" @click="cart.setQty(it.slug, (Number(it.qty) || 1) + 1)">+</button>
                </div>
              </div>

              <div class="addons">
                <span class="addons__label">Aditamentos</span>
                <div class="addons__list">
                  <label v-for="a in cart.aditamentos" :key="a.key" class="addon">
                    <input
                      type="checkbox"
                      :checked="!!it.addons?.[a.key]"
                      @change="cart.toggleAddon(it.slug, a.key)"
                    />
                    <span class="addon__name">{{ t(a.labelKey) }}</span>
                    <span v-if="Number(a.precio) > 0" class="addon__price">+ {{ formatMoney(a.precio) }}</span>
                  </label>
                </div>
                <p v-if="cart.aditamentos.every(a => Number(a.precio) === 0)" class="addons__note">
                  Nota: los precios de aditamentos están en \(0\) por ahora (configurable).
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside class="cart__summary">
          <div class="summary-card">
            <h3 class="summary-card__title">Resumen</h3>
            <div class="summary-row">
              <span>Subtotal</span>
              <span>{{ formatMoney(cart.subtotal.value) }}</span>
            </div>
            <div class="summary-row">
              <span>Aditamentos</span>
              <span>{{ formatMoney(cart.addonsTotal.value) }}</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row summary-row--total">
              <span>Total</span>
              <span>{{ formatMoney(cart.total.value) }}</span>
            </div>
            <button type="button" class="btn btn-primary summary-card__cta" @click="proceedToCheckout">
              Proceder al pago
            </button>
            <button type="button" class="btn btn-outline summary-card__secondary" @click="cart.clearCart()">
              Vaciar carrito
            </button>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.cart__grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1.5rem;
  align-items: start;
}

.cart-empty {
  text-align: center;
  padding: 3rem 1.25rem;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 20px;
}

.cart__items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
}

.cart-item__main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.cart-item__title h3 {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.cart-item__price {
  color: var(--color-primary);
  font-weight: 700;
}

.cart-item__muted {
  color: var(--color-text-muted);
  font-weight: 500;
  font-size: 0.9rem;
}

.cart-item__remove {
  background: transparent;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 12px;
  padding: 0.5rem 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.cart-item__remove:hover {
  border-color: rgba(0,0,0,0.25);
  transform: translateY(-1px);
}

.cart-item__controls {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 1.25rem;
}

.qty__label,
.addons__label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.qty__box {
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  gap: 0.5rem;
  align-items: center;
}

.qty__btn {
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.12);
  background: #fff;
  cursor: pointer;
}

.qty__input {
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.12);
  padding: 0 0.75rem;
  text-align: center;
}

.addons__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
}

.addon {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,0.08);
  background: rgba(255,255,255,0.9);
  cursor: pointer;
}

.addon__name {
  font-size: 0.95rem;
}
.addon__price {
  font-size: 0.9rem;
  color: var(--color-primary);
  font-weight: 700;
}

.addons__note {
  margin-top: 0.75rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.summary-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: 0 12px 24px rgba(0,0,0,0.08);
  position: sticky;
  top: 96px;
}

.summary-card__title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.45rem 0;
  color: #222;
}

.summary-divider {
  height: 1px;
  background: rgba(0,0,0,0.08);
  margin: 0.75rem 0;
}

.summary-row--total {
  font-size: 1.2rem;
  font-weight: 800;
}

.summary-card__cta {
  width: 100%;
  margin-top: 1rem;
}

.summary-card__secondary {
  width: 100%;
  margin-top: 0.75rem;
}

@media (max-width: 980px) {
  .cart__grid {
    grid-template-columns: 1fr;
  }
  .summary-card {
    position: static;
  }
  .cart-item__controls {
    grid-template-columns: 1fr;
  }
}
</style>

