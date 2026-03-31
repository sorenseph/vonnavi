import { computed, inject } from 'vue'

export function useCart() {
  const cart = inject('cart', null)
  if (!cart) {
    throw new Error('Cart not provided. Ensure App.vue provides `cart`.')
  }

  const itemCount = computed(() =>
    cart.items.value.reduce((acc, it) => acc + (Number(it.qty) || 0), 0)
  )

  return {
    ...cart,
    itemCount
  }
}

