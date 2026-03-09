# Supabase - Solución de problemas

## Error 404 en /rest/v1/paquetes

Si obtienes **404 Not Found** al hacer requests a:
```
https://tu-proyecto.supabase.co/rest/v1/paquetes
```

### Causa
La tabla `paquetes` **no existe** en tu base de datos. El 404 indica que el recurso (tabla) no fue encontrado.

### Solución

1. **Abre tu proyecto en Supabase Dashboard**: https://supabase.com/dashboard
2. Ve a **SQL Editor**
3. Crea una nueva query
4. **Copia y pega todo el contenido** de `supabase/setup-completo.sql`
5. Haz clic en **Run** (o Ctrl+Enter)
6. Verifica que no haya errores en el resultado

### Verificar que las tablas existen

En Supabase Dashboard → **Table Editor**, deberías ver:
- `paquetes`
- `promociones`
- `cotizaciones`
- `reservaciones`

### Variables de entorno

Asegúrate de tener en tu `.env`:

```
VITE_SUPABASE_URL=https://vhjzzbqjifnzgjzvulsq.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

La URL debe coincidir con tu proyecto. Encuéntrala en:
Supabase Dashboard → **Settings** → **API** → Project URL

### Ejecutar SQL desde local

**No se puede ejecutar SQL directamente desde tu app local.** Las migraciones/scripts SQL deben ejecutarse en:

1. **Supabase Dashboard** → SQL Editor (recomendado)
2. **Supabase CLI**: `supabase db push` (si usas migraciones)
3. **psql** conectando a tu proyecto (Connection string en Settings → Database)

### Si sigues con 404

1. Confirma que estás usando el **Project URL correcto** (no confundir con otros proyectos)
2. Revisa que la tabla `paquetes` exista en Table Editor
3. Si usas RLS, verifica que la política "Paquetes públicos" permita SELECT para usuarios anónimos

---

## Error 400 en Login (auth/v1/token)

Si al iniciar sesión obtienes **400 Bad Request** en:
```
https://tu-proyecto.supabase.co/auth/v1/token?grant_type=password
```

### Causa
Los usuarios de Supabase **Auth** no se crean con SQL. Las tablas de `setup-completo.sql` son para datos de negocio (paquetes, reservaciones, etc.), pero los usuarios que inician sesión deben crearse en **Authentication**.

### Solución

1. Ve a **Supabase Dashboard** → **Authentication** → **Users**
2. Haz clic en **Add user** → **Create new user**
3. Crea los usuarios de prueba:
   - Email: `admin@vonnavi.com` | Password: `Admin123`
   - Email: `ventas@vonnavi.com` | Password: `Ventas123`
4. (Opcional) Desactiva **Confirm email** en Settings → Auth si quieres acceso inmediato sin verificar correo

### Requisitos de contraseña
- Mínimo 6 caracteres (Supabase por defecto)

### Usar Supabase Local (opcional)

Si quieres trabajar con Supabase en local:

1. **Instalar Supabase CLI**: `npm install -g supabase`
2. **Iniciar Supabase local**: `supabase start`
3. **Studio local**: Abre la URL que muestra (ej. http://localhost:54323)
4. **Crear usuarios**: Ve a Authentication → Users → Add user
5. **Actualizar .env** con las credenciales locales que muestra `supabase start`

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Script para crear usuarios (con Service Role Key)

Si tienes la **Service Role Key** (Settings → API → service_role), ejecuta:

```bash
SUPABASE_URL=https://vhjzzbqjifnzgjzvulsq.supabase.co SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key npm run seed:users
```

O crea un archivo `.env.local` (no lo subas a git) con:
```
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Y ejecuta `npm run seed:users` (el script usa VITE_SUPABASE_URL si SUPABASE_URL no está definido).

⚠️ **NUNCA** expongas la service_role en el frontend ni la subas a git.

---

## Error 404 en translate-blog (Edge Functions)

Si al hacer clic en **Traducir desde español** en el admin del blog obtienes un error y en la consola aparece:

```
Request URL: https://vhjzzbqjifnzgjzvulsq.supabase.co/functions/v1/translate-blog
Status Code: 404 Not Found (OPTIONS)
```

### Causa
La **Edge Function** `translate-blog` no está desplegada en tu proyecto de Supabase. Por defecto las funciones que están en `supabase/functions/translate-blog/` solo existen en el código, no en el servidor.

### Solución: desplegar la función

**1. Instalar Supabase CLI** (si no lo tienes):

```bash
npm install -g supabase
```

Si `supabase` no se reconoce después de instalar, usa **npx** en su lugar:

```bash
npx supabase login
npx supabase link --project-ref vhjzzbqjifnzgjzvulsq
npx supabase functions deploy translate-blog
```

**2. Iniciar sesión y enlazar el proyecto:**

```bash
npx supabase login
```

Se abrirá el navegador para autenticarte.

```bash
npx supabase link --project-ref vhjzzbqjifnzgjzvulsq
```

Te pedirá la contraseña de la base de datos (la puedes ver/regenerar en Dashboard → Settings → Database).

**3. Desplegar la función:**

```bash
npx supabase functions deploy translate-blog
```

### Alternativa

Si no puedes desplegar, el botón **Traducir desde español** seguirá mostrando un aviso. Puedes escribir manualmente el contenido en cada idioma (ES, EN, FR, PT) en las pestañas del formulario del blog.

---

## Emails no se envían (cliente: false, admin: false)

Si al enviar una solicitud de reserva obtienes `{"ok":true,"cliente":false,"admin":false}`, la Edge Function ejecutó correctamente pero **Resend rechazó el envío**.

### Causas frecuentes

1. **RESEND_API_KEY no configurado o inválido**  
   Verifica en Supabase Dashboard → Project Settings → Edge Functions → Secrets.

2. **Dominio no verificado en Resend**  
   Si usas `noreply@tudominio.com`, debes verificar el dominio en Resend. Para pruebas puedes usar `onboarding@resend.dev` (límite de 100 emails/día).

3. **Configurar secretos:**
   ```bash
   npx supabase secrets set RESEND_API_KEY=re_xxx
   npx supabase secrets set FROM_EMAIL="Von Navi <onboarding@resend.dev>"
   ```
   Luego vuelve a desplegar: `npx supabase functions deploy send-quote-email`
