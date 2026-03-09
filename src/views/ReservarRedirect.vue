<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReservarModal } from '../composables/useReservarModal'

const route = useRoute()
const router = useRouter()
const { open } = useReservarModal()

onMounted(() => {
  const q = route.query
  open({
    paquete: q.paquete,
    fecha: q.fecha,
    adultos: q.adultos,
    ninos: q.ninos
  })
  router.replace('/')
})
</script>

<template>
  <div class="section py-20 text-center text-stone-600">
    <p>Cargando...</p>
  </div>
</template>
