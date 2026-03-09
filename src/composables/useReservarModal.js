import { inject } from 'vue'

const RESERVAR_MODAL_KEY = 'reservarModal'

export function useReservarModal() {
  const modal = inject(RESERVAR_MODAL_KEY)
  if (!modal) {
    return {
      isOpen: { value: false },
      initialParams: { value: {} },
      open: () => {},
      close: () => {}
    }
  }
  return modal
}
