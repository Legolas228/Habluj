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

## Deploy

Proyecto preparado para Vercel:

- output en `build/`
- rewrite SPA hacia `index.html`
- headers de seguridad reforzados en `vercel.json` (CSP, HSTS, Referrer-Policy, Permissions-Policy)

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
