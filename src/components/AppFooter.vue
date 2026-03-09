<script setup>
import { useI18n } from 'vue-i18n'
import { useReservarModal } from '../composables/useReservarModal'
import logoImg from '@/assets/logo/7CotyrWR5Rxspd32kh56jj2tdNk.png'

const { t } = useI18n()
const { open: openReservarModal } = useReservarModal()

const links = [
  { path: '/', labelKey: 'nav.home' },
  { path: '/vonnavi', labelKey: 'nav.about' },
  { path: '/paquetes', labelKey: 'nav.packages' },
  { path: '/blog', labelKey: 'nav.blog' },
  { path: '/reservar', labelKey: 'nav.reserve', openModal: true }
]

const socialLinks = [
  { name: 'Facebook', url: 'https://www.facebook.com/vonnavi', icon: 'facebook' },
  { name: 'Instagram', url: 'https://www.instagram.com/vonnavi', icon: 'instagram' },
  { name: 'X (Twitter)', url: 'https://x.com/vonnavi', icon: 'x' }
]
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <img :src="logoImg" alt="Von Navi" class="footer__logo" />
          <p>{{ t('footer.tagline') }}</p>
          <div class="footer__social">
            <a
              v-for="s in socialLinks"
              :key="s.icon"
              :href="s.url"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="s.name"
              class="footer__social-link"
            >
              <svg v-if="s.icon === 'facebook'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <svg v-else-if="s.icon === 'instagram'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              <svg v-else-if="s.icon === 'x'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>
        <div class="footer__links">
          <h4>{{ t('footer.pages') }}</h4>
          <template v-for="link in links" :key="link.path">
            <router-link v-if="!link.openModal" :to="link.path">{{ t(link.labelKey) }}</router-link>
            <button v-else type="button" class="footer__link-btn" @click="openReservarModal()">{{ t(link.labelKey) }}</button>
          </template>
        </div>
        <div class="footer__contact">
          <h4>{{ t('footer.contact') }}</h4>
          <p><strong>{{ t('footer.email') }}:</strong> ventas@vonnavi.com.mx</p>
          <p><strong>{{ t('footer.phone') }}:</strong> (+52) 55 3550 1265</p>
          <p><strong>{{ t('footer.address') }}:</strong> {{ t('footer.addressValue') }}</p>
        </div>
      </div>
      <div class="footer__bottom">
        <p>{{ t('footer.copyright', { year: new Date().getFullYear() }) }}</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--color-bg-card);
  border-top: 1px solid rgba(0,0,0,0.08);
  padding: 4rem 0 2rem;
  margin-top: auto;
}

.footer__grid {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 3rem;
  margin-bottom: 2rem;
}

.footer__logo {
  height: 48px;
  width: auto;
  margin-bottom: 1rem;
}

.footer__brand p,
.footer__contact p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.footer__social {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.footer__social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(214, 151, 49, 0.1);
  color: var(--color-primary);
  transition: all 0.3s;
}

.footer__social-link:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-2px);
}

.footer__links h4,
.footer__contact h4 {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.footer__links a,
.footer__links .footer__link-btn {
  color: var(--color-text-muted);
}

.footer__link-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.footer__link-btn:hover {
  color: var(--color-primary);
}

.footer__bottom {
  padding-top: 2rem;
  border-top: 1px solid rgba(0,0,0,0.08);
  text-align: center;
}

.footer__bottom p {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .footer__grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .footer__logo {
    margin-left: auto;
    margin-right: auto;
  }
  .footer__social {
    justify-content: center;
  }
}
</style>
