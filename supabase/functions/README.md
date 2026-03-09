# Edge Functions - Von Navi

## send-quote-email

Envía correos al cliente (confirmación) y al admin (israelcardenas6@gmail.com) cuando se solicita una cotización. Usa Resend.

### Configuración

1. Crear cuenta en [Resend.com](https://resend.com) y verificar un dominio
2. Obtener la API Key en Resend Dashboard → API Keys
3. Configurar secretos en Supabase:

```bash
supabase secrets set RESEND_API_KEY=re_tu_clave_real_aqui
supabase secrets set FROM_EMAIL="Von Navi <noreply@tudominio.com>"
supabase secrets set SITE_URL="https://vonnavi.com.mx"
supabase secrets set ADMIN_EMAIL="israelcardenas6@gmail.com"
```

El logo se toma de SITE_URL/logo.svg (ya existe en public/logo.svg).

> **Nota:** Nunca subas tu API Key al repositorio.

5. Desplegar la función:

```bash
supabase functions deploy send-quote-email
```

### Ejemplo de integración Resend (referencia)

La función usa la API de Resend así:

```javascript
const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${RESEND_API_KEY}`,
  },
  body: JSON.stringify({
    from: FROM_EMAIL,
    to: payload.email,
    subject: 'Von Navi - Confirmación de cotización',
    html: '...'
  }),
})
```

### Alternativa: Sin Resend

Si no configuras `RESEND_API_KEY`, la función no enviará emails pero retornará éxito. Las cotizaciones se guardan en Supabase y aparecen en el panel admin. Puedes integrar otro proveedor (SendGrid, etc.) editando `index.ts`.
||