<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart'
import { useSeo } from '@/composables/useSeo'

const route = useRoute()
const router = useRouter()
const cart = useCart()

const showCanceled = computed(() => route.query.canceled === '1')
const showSuccess = computed(() => route.query.success === '1')

useSeo({
  title: 'Checkout | Von Navi',
  description: 'Confirma tu compra y procede al pago.'
})

const isEmpty = computed(() => (cart.items.value?.length || 0) === 0)

function formatMoney(n) {
  return `$${Number(n || 0).toLocaleString('es-MX')}`
}

async function pagar() {
  if (!cart.items.value?.length) return
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`,
      'apikey': anonKey
    },
    body: JSON.stringify({
      client_origin: typeof window !== 'undefined' ? window.location.origin : '',
      client_base: import.meta.env.BASE_URL || '/',
      items: cart.items.value.map(it => ({
        slug: it.slug,
        qty: it.qty,
        addons: it.addons || {}
      }))
    })
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data?.url) {
    alert(data?.error || 'No se pudo iniciar el pago')
    return
  }
  window.location.href = data.url
}
</script>

<template>
  <div class="section section-bg-warm">
    <div class="container checkout">
      <div class="checkout__header">
        <div>
          <h1 class="section-title">Checkout</h1>
          <p class="section-subtitle">Revisa el total y confirma el pago.</p>
        </div>
        <router-link to="/carrito" class="btn btn-outline">Volver al carrito</router-link>
      </div>

      <p v-if="showCanceled" class="checkout-banner checkout-banner--warn" role="status">
        Cancelaste el pago en Stripe. Tu carrito sigue igual; puedes reintentar cuando quieras.
      </p>
      <p v-if="showSuccess" class="checkout-banner checkout-banner--ok" role="status">
        Pago recibido (pruebas). Gracias. Si necesitas comprobante, revisa el correo de Stripe o el panel.
      </p>

      <div v-if="isEmpty" class="checkout-empty">
        <h3>No hay items para pagar</h3>
        <p>Agrega un paquete al carrito para continuar.</p>
        <router-link to="/paquetes" class="btn btn-primary">Ver paquetes</router-link>
      </div>

      <div v-else class="checkout__grid">
        <div class="checkout__details">
          <div class="card">
            <h3 class="card__title">Tu compra</h3>
            <div class="line" v-for="it in cart.items.value" :key="it.slug">
              <span class="line__left">
                <strong>{{ it.nombre || it.slug }}</strong>
                <span class="line__muted">× {{ it.qty }}</span>
              </span>
              <span class="line__right">{{ formatMoney((Number(it.precio) || 0) * (Number(it.qty) || 0)) }}</span>
            </div>
            <div class="divider"></div>
            <div class="line">
              <span>Subtotal</span>
              <span>{{ formatMoney(cart.subtotal.value) }}</span>
            </div>
            <div class="line">
              <span>Aditamentos</span>
              <span>{{ formatMoney(cart.addonsTotal.value) }}</span>
            </div>
            <div class="divider"></div>
            <div class="line line--total">
              <span>Total</span>
              <span>{{ formatMoney(cart.total.value) }}</span>
            </div>
          </div>
        </div>

        <aside class="checkout__actions">
          <div class="card">
            <h3 class="card__title">Pago</h3>
            <p class="card__text">
              Aquí vamos a conectar el proveedor de pago (por ejemplo Stripe o MercadoPago) para crear la sesión y redirigir.
            </p>
            <button type="button" class="btn btn-primary w-full" @click="pagar">
              Pagar {{ formatMoney(cart.total.value) }}
            </button>
            <button type="button" class="btn btn-outline w-full mt-3" @click="router.push('/paquetes')">
              Agregar más paquetes
            </button>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.checkout__grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1.5rem;
  align-items: start;
}

.checkout-empty {
  text-align: center;
  padding: 3rem 1.25rem;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 20px;
}

.card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: 0 10px 24px rgba(0,0,0,0.08);
}

.card__title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.card__text {
  color: var(--color-text-muted);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.45rem 0;
}
.line__left {
  display: inline-flex;
  align-items: baseline;
  gap: 0.5rem;
}
.line__muted {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
.line--total {
  font-size: 1.2rem;
  font-weight: 800;
}
.divider {
  height: 1px;
  background: rgba(0,0,0,0.08);
  margin: 0.75rem 0;
}

.w-full { width: 100%; }
.mt-3 { margin-top: 0.75rem; }

.checkout-banner {
  padding: 0.85rem 1.1rem;
  border-radius: 14px;
  margin-bottom: 1.25rem;
  font-size: 0.95rem;
  line-height: 1.5;
}
.checkout-banner--warn {
  background: rgba(214, 151, 49, 0.12);
  border: 1px solid rgba(214, 151, 49, 0.35);
  color: #5c3d0f;
}
.checkout-banner--ok {
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.35);
  color: #14532d;
}

@media (max-width: 980px) {
  .checkout__grid {
    grid-template-columns: 1fr;
  }
}
</style>

