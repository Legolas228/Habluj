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

## Ejecutar backend (local)

Desde la raíz del proyecto:

```bash
cd backend
```

Activa el entorno virtual (Linux/macOS):

```bash
source .venv/bin/activate
```

Si no tienes las dependencias instaladas:

```bash
pip install -r requirements.txt
```

Aplica migraciones y levanta el servidor Django:

```bash
python manage.py migrate
python manage.py runserver
```

Backend disponible en:

- `http://127.0.0.1:8000`
- `http://127.0.0.1:8000/api/`

Opcional (frontend -> backend local):

- En tu `.env` del frontend, usa `VITE_API_BASE_URL=http://127.0.0.1:8000`

Atajo para levantar frontend + backend juntos:

```bash
bash scripts/dev-up.sh
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

## Politica de reservas (lanzamiento)

- Reserva de alumnos: **solo via Setmore** (`https://habluj.setmore.com/`)
- El flujo interno de reserva/pago en frontend queda deshabilitado durante lanzamiento
- Mantener esta regla en nuevos CTAs, enlaces y componentes hasta activar la siguiente fase

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

Pasos recomendados despues de crear la web app:

```bash
source ~/.virtualenvs/habluj/bin/activate
cd ~/Habluj/backend
pip install -r requirements.txt
python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py check
```

En la pestaña **Web > Static files** de PythonAnywhere, mapear:

- URL: `/static/`
- Directory: `/home/Legolas228/Habluj/backend/staticfiles`

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
- `DRF_THROTTLE_ANON` (por defecto `60/min`)
- `DRF_THROTTLE_USER` (por defecto `240/min`)
- `DRF_THROTTLE_STUDENT_LOGIN` (por defecto `10/min`)
- `DRF_THROTTLE_STUDENT_REGISTER` (por defecto `5/min`)
- `DRF_THROTTLE_LEAD_CREATE` (por defecto `15/min`)
- `DRF_THROTTLE_GOPAY_WEBHOOK` (por defecto `120/min`)
- `AUTH_IP_ATTEMPT_WINDOW_SECONDS` (por defecto `3600`)
- `AUTH_IP_LOCK_MIN_FAILURES` (por defecto `5`)
- `AUTH_IP_LOCK_BASE_SECONDS` (por defecto `60`)
- `AUTH_IP_LOCK_MAX_SECONDS` (por defecto `3600`)
- `DJANGO_DATA_UPLOAD_MAX_MEMORY_SIZE` (por defecto `2097152` = 2MB)
- `DJANGO_FILE_UPLOAD_MAX_MEMORY_SIZE` (por defecto `5242880` = 5MB)
- `DJANGO_DATA_UPLOAD_MAX_NUMBER_FIELDS` (por defecto `2000`)
- `STUDENT_MATERIAL_MAX_UPLOAD_BYTES` (por defecto `10485760` = 10MB)
- `STUDENT_MATERIAL_ALLOWED_EXTENSIONS` (CSV de extensiones permitidas)
- `MAILERLITE_API_KEY`
- `MAILERLITE_LEAD_GROUP_ID` (opcional)
- `MAILERLITE_SENDER_EMAIL` (requerido para enviar correo a Ester)
- `MAILERLITE_SENDER_NAME` (opcional, por defecto `Habluj`)
- `MAILERLITE_NOTIFICATION_TO` (por defecto `habluj.sk@gmail.com`)
- `DJANGO_ADMIN_BASE_URL` (opcional, para enlazar al lead en el email)

Ejemplo minimo para produccion gratuita (PythonAnywhere):

- `DJANGO_DEBUG=false`
- `DJANGO_SECRET_KEY=<clave-larga-segura>`
- `DJANGO_ALLOWED_HOSTS=legolas228.pythonanywhere.com,localhost,127.0.0.1`
- `DJANGO_CORS_ALLOWED_ORIGINS=https://habluj.vercel.app`
- `DJANGO_CSRF_TRUSTED_ORIGINS=https://habluj.vercel.app`
- `DRF_THROTTLE_ANON=40/min`
- `DRF_THROTTLE_USER=180/min`
- `DRF_THROTTLE_STUDENT_LOGIN=8/min`
- `DRF_THROTTLE_STUDENT_REGISTER=4/min`
- `DRF_THROTTLE_LEAD_CREATE=8/min`
- `DRF_THROTTLE_GOPAY_WEBHOOK=90/min`
- `AUTH_IP_ATTEMPT_WINDOW_SECONDS=3600`
- `AUTH_IP_LOCK_MIN_FAILURES=5`
- `AUTH_IP_LOCK_BASE_SECONDS=60`
- `AUTH_IP_LOCK_MAX_SECONDS=3600`
- `DJANGO_DATA_UPLOAD_MAX_MEMORY_SIZE=2097152`
- `DJANGO_FILE_UPLOAD_MAX_MEMORY_SIZE=5242880`
- `DJANGO_DATA_UPLOAD_MAX_NUMBER_FIELDS=2000`
- `STUDENT_MATERIAL_MAX_UPLOAD_BYTES=10485760`
- `STUDENT_MATERIAL_ALLOWED_EXTENSIONS=pdf,txt,doc,docx,png,jpg,jpeg,webp,mp3,wav,m4a,mp4,mov`

### Crear cuenta de Ester (admin de leads)

Desde `backend/` puedes crear o actualizar una cuenta staff con permisos solo de leads:

```bash
python manage.py bootstrap_ester_admin --username ester --email habluj.sk@gmail.com --password "CAMBIAR-ESTA-CLAVE"
```

Esta cuenta entra al panel Django en `/admin/` y puede gestionar leads sin ser superuser.

Si necesitas un superuser completo en produccion:

```bash
python manage.py createsuperuser
```

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

Ademas, para SEO consistente (canonical, hreflang y Open Graph), configura tambien:

- `VITE_SITE_URL=https://habluj.sk`

Tambien es recomendable declararlo explicitamente en Vercel Project Settings > Environment Variables (Production, Preview y Development) para no depender del fallback de codigo.

## Mantenimiento rapido

### Verificar rotacion de secretos (pre-deploy)

Antes de desplegar backend, valida que no queden placeholders ni secretos vacios:

```bash
cd backend
bash scripts/verify_secret_rotation.sh
```

Si falla, rota credenciales en proveedores y actualiza variables de entorno en produccion.

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

### Monitorizacion minima (checklist semanal)

1. Abrir `https://habluj.vercel.app/` y comprobar carga de home.
2. Verificar `https://legolas228.pythonanywhere.com/api/` (respuesta 200).
3. Revisar error log en PythonAnywhere:
  - `/var/log/legolas228.pythonanywhere.com.error.log`
4. Probar login alumno y registro de lead en frontend.
5. Confirmar ultimo deploy `Ready` en Vercel.

Smoke post-deploy automatizado:

```bash
FRONTEND_URL="https://habluj.vercel.app" API_BASE_URL="https://legolas228.pythonanywhere.com" bash scripts/post_deploy_smoke.sh
```

### Backup SQLite

Script incluido:

- `backend/scripts/backup_db.sh`

Uso:

```bash
bash ~/Habluj/backend/scripts/backup_db.sh
```

Opcional con ruta custom:

```bash
bash ~/Habluj/backend/scripts/backup_db.sh "$HOME/backups/habluj" "$HOME/Habluj/backend/db.sqlite3"
```

Se recomienda crear una tarea programada en PythonAnywhere (Tasks) para ejecutarlo diariamente.

### Mantener la web gratis activa

En cuentas free de PythonAnywhere, hay que entrar al panel y pulsar periodicamente:

- `Run until 1 month from today`
