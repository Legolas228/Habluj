# Habluj Web

Frontend público de **Habluj** (React + Vite), con soporte multilenguaje (`sk`, `cz`, `es`), enfoque SEO y formularios de contacto conectados a backend.

## Stack

- React 18
- Vite 6
- Tailwind CSS
- React Router v6
- React Hook Form + Zod
- Vitest + Testing Library

## Requisitos

- Node.js 20+
- npm 9+

## Comandos

```bash
# desarrollo (puerto configurado: 4028)
npm run dev

# tests
npm run test -- --run

# build producción
npm run build

# preview local del build
npm run serve
```

## Estructura principal

```text
src/
  components/              # UI y bloques reutilizables
  context/                 # LanguageContext y estado global de idioma
  locales/                 # Traducciones ES/SK/CZ
  pages/                   # Home, servicios, contacto, legal, etc.
  services/                # Integraciones (leads/contacto)
  utils/                   # SEO helpers, contacto y utilidades
```

## SEO y routing

- Landing principal: `/`
- `/homepage` redirige a `/`
- Ruta `*` muestra `NotFound` (noindex)
- `sitemap.xml` con `hreflang` y `x-default`
- Metadata y canonical gestionadas por página

## Contacto y branding actuales

- Canales públicos: **email + Instagram `@habluj_sk`**
- Sin teléfono ni WhatsApp en el frontend público
- Copys de CTA y meta orientados a marca **Habluj-first**

## Deploy (100% gratuito)

### Estado actual

- Frontend: **Vercel** (auto-deploy conectado al repo)
- Backend: **PythonAnywhere (free tier)** en `https://legolas228.pythonanywhere.com`
- Ramas principales activas: `master` y `producción`

### Frontend (Vercel)

Proyecto preparado para Vercel:

- output en `build/`
- rewrite SPA hacia `index.html`
- headers de seguridad reforzados en `vercel.json` (CSP, HSTS, Referrer-Policy, Permissions-Policy)

La app usa `VITE_API_BASE_URL` si existe. Si no existe, en producción cae por defecto a:

- `https://legolas228.pythonanywhere.com`

### Backend (PythonAnywhere)

Configuracion usada:

- tipo de web app: **Manual configuration**
- version Python: **3.11**
- virtualenv: `/home/Legolas228/.virtualenvs/habluj`
- codigo backend: `/home/Legolas228/Habluj/backend`
- WSGI file: `/var/www/legolas228_pythonanywhere_com_wsgi.py`

El root (`/`) puede devolver `404 Not Found` y es normal en Django si no hay ruta raiz; el API vive bajo `/api/`.

### Nota importante sobre repo privado

Si el repositorio vuelve a `private`, **la web ya desplegada sigue funcionando**, pero para futuras actualizaciones del backend en PythonAnywhere necesitaras una de estas opciones:

1. Usar token de GitHub (PAT) para `git clone`/`git pull`.
2. Poner el repo temporalmente publico para actualizar y volverlo privado.
3. Subir el codigo por zip/archivo manualmente.

No afecta al frontend ya desplegado en Vercel mientras no cambies su conexion Git.

## Seguridad backend (Django)

Para despliegue, configura estas variables de entorno en backend:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG` (`false` en producción)
- `DJANGO_ALLOWED_HOSTS` (CSV, por ejemplo: `habluj.sk,www.habluj.sk`)
- `DJANGO_CORS_ALLOWED_ORIGINS` (CSV de orígenes permitidos)
- `DJANGO_CSRF_TRUSTED_ORIGINS` (CSV con esquemas `https://...`)
- `BREVO_API_KEY`
- `BREVO_LEAD_LIST_ID` (opcional)
- `BREVO_SENDER_EMAIL` (requerido para enviar correo a Ester)
- `BREVO_SENDER_NAME` (opcional, por defecto `Habluj`)
- `BREVO_NOTIFICATION_TO` (por defecto `habluj.sk@gmail.com`)
- `DJANGO_ADMIN_BASE_URL` (opcional, para enlazar al lead en el email)

Ejemplo minimo para produccion gratuita (PythonAnywhere):

- `DJANGO_DEBUG=false`
- `DJANGO_SECRET_KEY=<clave-larga-segura>`
- `DJANGO_ALLOWED_HOSTS=legolas228.pythonanywhere.com,localhost,127.0.0.1`
- `DJANGO_CORS_ALLOWED_ORIGINS=https://habluj.vercel.app`
- `DJANGO_CSRF_TRUSTED_ORIGINS=https://habluj.vercel.app`

### Crear cuenta de Ester (admin de leads)

Desde `backend/` puedes crear o actualizar una cuenta staff con permisos solo de leads:

```bash
python manage.py bootstrap_ester_admin --username ester --email habluj.sk@gmail.com --password "CAMBIAR-ESTA-CLAVE"
```

Esta cuenta entra al panel Django en `/admin/` y puede gestionar leads sin ser superuser.

### Dashboard React para Ester

Ruta: `/ester-dashboard`

El login del dashboard usa credenciales de Django admin (Basic Auth) y consume:

- `GET /api/leads/`
- `GET /api/leads/metrics/`
- `PATCH /api/leads/{id}/`

Por tanto, la cuenta debe ser `staff` y tener permisos sobre `Lead`.

## Leads En Produccion

El frontend necesita `VITE_API_BASE_URL` en Vercel para enviar consultas al backend real.

Si falta en producción, el formulario mostrará error y no enviará el lead.

Valor recomendado actual:

- `VITE_API_BASE_URL=https://legolas228.pythonanywhere.com`

## Mantenimiento rapido

### Actualizar backend en PythonAnywhere

Desde consola bash en PythonAnywhere:

```bash
source ~/.virtualenvs/habluj/bin/activate
cd ~/Habluj
# si repo publico:
git pull
# si repo privado sin token, usar zip manual
cd backend
pip install -r requirements.txt
python manage.py migrate --noinput
python manage.py check
```

Luego, en la pestaña **Web** de PythonAnywhere, pulsa:

- `Reload Legolas228.pythonanywhere.com`

### Mantener la web gratis activa

En cuentas free de PythonAnywhere, hay que entrar al panel y pulsar periodicamente:

- `Run until 1 month from today`
