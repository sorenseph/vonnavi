<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSeo } from '../composables/useSeo'
import { supabase } from '../lib/supabase'

const { t } = useI18n()

useSeo({
  title: 'Iniciar Sesión | Von Navi Admin'
})

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function login() {
  if (!email.value || !password.value) {
    error.value = 'Ingresa email y contraseña'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
    if (err) throw err
    const redirect = route.query.redirect || '/admin'
    router.push(redirect)
  } catch (e) {
    error.value = e.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page section">
    <div class="container" style="max-width: 420px;">
      <h1 class="section-title">{{ t('login.title') }}</h1>
      <p class="section-subtitle">{{ t('login.subtitle') }}</p>
      <form @submit.prevent="login" class="login-form">
        
        <div class="form-group">
          <label>{{ t('login.email') }}</label>
          <input v-model="email" type="email" placeholder="admin@vonnavi.com" required />
        </div>
        <div class="form-group">
          <label>{{ t('login.password') }}</label>
          <input v-model="password" type="password" placeholder="••••••••" required />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button type="submit" class="btn btn-primary btn--full" :disabled="loading">
          {{ loading ? t('login.sending') : t('login.submit') }}
        </button>
      </form>
    </div>
  </div>
  <p class="login-hint">
        
          <!--
          <code>admin@vonnavi.com</code> / <code>Admin123</code><br />
          <code>ventas@vonnavi.com</code> / <code>Ventas123</code>
          -->
        </p>
</template>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: var(--color-bg-card);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.08);
}

.login-hint {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.6);
  padding: 1rem;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
}

.login-hint code {
  background: rgba(0,0,0,0.3);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.9rem;
}

.error-msg {
  color: #f87171;
  font-size: 0.9rem;
}
</style>
