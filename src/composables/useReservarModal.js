import { ref } from 'vue'

const isOpen = ref(false)
const initialParams = ref({})

export function useReservarModal() {
  function open(params = {}) {
    initialParams.value = { ...params }
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    initialParams.value = {}
  }

  return { isOpen, initialParams, open, close }
}
