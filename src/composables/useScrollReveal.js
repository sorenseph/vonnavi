import { onMounted, onUnmounted } from 'vue'

export function useScrollReveal() {
  let observer

  onMounted(() => {
    const elements = document.querySelectorAll('.animate-on-scroll')
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running'
            entry.target.style.visibility = 'visible'
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    elements.forEach((el) => observer.observe(el))
  })

  onUnmounted(() => {
    observer?.disconnect()
  })
}
