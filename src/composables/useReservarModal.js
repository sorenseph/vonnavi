import { inject } from 'vue'

const RESERVAR_MODAL_KEY = 'reservarModal'

/** Abre el modal desde cualquier lugar (usa evento global para máxima compatibilidad en producción) */
export function openReservarModal(params = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vonnavi-open-reservar', { detail: params }))
  }
}

/** Para componentes que necesitan abrir el modal: siempre usa el evento global */
export function useReservarModal() {
  const modal = inject(RESERVAR_MODAL_KEY)
  return {
    isOpen: modal?.isOpen ?? { value: false },
    initialParams: modal?.initialParams ?? { value: {} },
    open: openReservarModal,
    close: modal?.close ?? (() => {})
  }
}
