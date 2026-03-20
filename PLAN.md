# PLAN.md — Plan de trabajo del proyecto Habluj

> Este archivo es la fuente de verdad del estado actual del proyecto y
> los próximos pasos a ejecutar. Todo agente de IA debe leerlo al inicio
> de cada sesión y actualizarlo al terminar sus cambios.
> Última actualización: 2026-03-19 (sesión 5 - Fase 2 operativa cerrada)

---

## Archivos de referencia obligatorios

Antes de tocar cualquier cosa, leer:

- `AGENT.md` — Convenciones, stack, estructura, patrones de código
- `ESTER.md` — Información real sobre Ester (precios, stats, bio, lo que NO poner)

---

## Estado general

| Fase     | Estado       | Descripción                                     |
|----------|--------------|-------------------------------------------------|
| Fase 1   | Completada   | Web estática informativa + Setmore              |
| Fase 2   | Completada   | Dashboard + backend Django + auth funcional     |
| Fase 3   | Pendiente    | Pagos, mensajería, notificaciones, PWA          |

---

## Tareas completadas

- [x] Análisis completo del codebase
- [x] Creado `AGENT.md` con convenciones, stack y patrones
- [x] Creado `ESTER.md` con información real sobre Ester
- [x] Arreglado error de build: instalado `cssnano` (faltaba en devDependencies)
- [x] Build de producción verificado y funcional (~7.64s)

---

## Fase 2 — COMPLETADA (Sesión 3)

### Autenticación e integración
- [x] Backend: Creado endpoint `/api/auth/register/` con UserRegisterSerializer
- [x] Frontend: Página de Sign Up con validación y manejo de errores
- [x] Frontend: Actualizado AuthContext para soportar register
- [x] Frontend: Actualizado studentAuth.js con función studentRegister
- [x] Configurado VITE_API_BASE_URL en .env (localhost:8000 para dev)

### Dashboard funcional
- [x] StudentDashboard integrado con datos reales del backend
- [x] Creado servicio `getUserProfile` para cargar perfil del estudiante
- [x] Dashboard carga: bookings, materials, nivel actual (language_level)
- [x] Mostrar próximas clases y historial de clases completadas
- [x] Ester Dashboard para leads ya funcional (sessions pasadas)

---

## Fase 1 — Tareas pendientes

### PRIORIDAD ALTA — Contenido (hacer primero)

- [x] **Reescribir `src/locales/sk.js`** (eslovaco)
  - Corregidos todos los datos falsos (precio 20€, 30+ alumnos, 4 años, 2 Olimpiadas reales)
  - Eliminados servicios falsos: clases grupales, DELE prep, español de negocios, paquetes
  - Eliminadas credenciales falsas (Magister/Comenius → Hispanistika/Universidad Carolina)
  - Corregida ubicación: Praha, no Bratislava; solo online
  - Timeline real: Olimpiadas → viajes España → Erasmus → 4 años enseñando
  - _Estado: COMPLETADO_

- [x] **Reescribir `src/locales/cz.js`** (checo)
  - Mismo contenido corregido que sk.js, ahora 100% en checo correcto
  - Anteriormente ~40% del contenido estaba en eslovaco sin traducir
  - _Estado: COMPLETADO_

- [x] **Reescribir `src/locales/es.js`** (español)
  - Mismo contenido corregido que sk.js
  - Rellenada clave vacía: `services.trialLesson`
  - _Estado: COMPLETADO_

### PRIORIDAD ALTA — Funcionalidad

- [x] **Integrar Setmore** como sistema de reservas externo
  - Reemplazada página `/tutoring-services` con nuevo diseño limpio
  - Eliminados 3 servicios falsos (grupos, negocio, DELE), eliminados paquetes falsos (90€/200€/450€)
  - Todos los botones "Reservar" apuntan a `SETMORE_BOOKING_URL` (constante fácil de actualizar)
  - ⚠️ Pendiente: configurar URL real de Setmore cuando esté disponible
  - _Estado: COMPLETADO (falta URL de Setmore)_

### PRIORIDAD MEDIA — SEO y rendimiento

- [x] **SEO: meta tags por página**
  - `about-the-teacher`: ya tenía Helmet (title, description, og:title, og:description)
  - `tutoring-services`: añadido Helmet con title y description + OG dinámicos
  - `homepage`: ya usaba document.title y querySelector (sin Helmet)
  - Keywords actualizadas quitando referencias falsas (Ester Novakova, DELE certifikácia)
  - _Estado: COMPLETADO_

- [x] **Performance: lazy loading y code splitting**
  - Implementado `React.lazy` en el router principal (`Routes.jsx`), aislando todo.
  - El pesado dashboard ahora usa `<Suspense>` interno.
  - Verificado que AppImage.jsx use load asíncrono.
  - _Estado: COMPLETADO_

- [x] **Sitemap y robots.txt**
  - Generar sitemap.xml con las rutas activas
  - Verificar robots.txt en /public
  - Se añadieron `robots.txt`, `sitemap.xml` con hreflangs, y se actualizó `manifest.json`.
  - _Estado: COMPLETADO_

### PRIORIDAD BAJA — Testing y deploy

- [x] **Tests unitarios de componentes principales**
  - Setup de Vitest + React Testing Library + jsdom exitosamente completo.
  - Test suites funcionales de validación subidos (Button y useTranslation).
  - _Estado: COMPLETADO_

- [x] **Deploy en Vercel**
  - Configurado script en `vercel.json` forzando index.html y headers de seguridad.
  - Validado script final (Builds promedian ~8.6s en empaquetar).
  - _Estado: COMPLETADO_

---

## Fase 2 — Dashboard + Backend + Booking propio (CASI COMPLETA)

### PRIORIDAD ALTA — Autenticación e integración

- [x] Login page ✅ (existe, conectado a backend)
- [x] **Register/Sign Up page** — formulario de registro nuevo ✅
  - Form con username, email, password, language level
  - Validación frontend (password strength, email format)
  - Integración con endpoint `/api/auth/register/` (backend)
  - _Estado: COMPLETADO_

- [x] **Configurar VITE_API_BASE_URL** en frontend ✅
  - Creado `.env` con URL del backend (dev: `http://localhost:8000`)
  - Verificar que login/logout funcionen contra backend real
  - _Estado: COMPLETADO_

### PRIORIDAD ALTA — Dashboard funcional

- [x] **Reemplazar datos mock en StudentDashboard** por datos reales ✅
  - Cargar bookings, progress, materials desde backend via servicios ✅
  - Mostrar clases próximas, historia de clases completadas ✅
  - Mostrar nivel actual desde UserProfile real ✅
  - _Estado: COMPLETADO_

- [x] **Sistema de booking propio (multi-paso)**
  - Página `/booking-system` con flujo: nivel → fecha → hora → confirmación
  - Conectado a modelo `Booking` del backend
  - Horarios iniciales configurados en slots y validación de conflicto desde API
  - _Estado: COMPLETADO_

- [x] **Ester Dashboard (admin simple)** — versión básica funcional ✅
  - Dashboard de leads existente funcional
  - Sección de estudiantes/clases: pendiente para mejoras futuras
  - _Estado: COMPLETADO (funcional para leads)_

### Entregas sesión 5 (hito de cierre operativo)

- [x] Dashboard de estudiante preparado para `sk/cz/es` en pestañas activas
  - Overview, Lessons, Progress, Goals, Resources, Payments y Messages adaptados a idioma activo.
  - Fechas/horas renderizadas por locale (`sk-SK`, `cs-CZ`, `es-ES`).

- [x] Editor de reservas en Ester Dashboard ahora permite cambiar clase (`lesson_id`)
  - Nuevo selector de clase en panel lateral de reserva.
  - Carga de clases admin vía `/api/lessons/`.
  - Guardado combinado: `lesson_id`, fecha, hora, estado y notas.

- [x] Backend soporta correctamente `lesson_id` en PATCH de reservas
  - Añadido `update()` en `BookingSerializer` para reasignar `lesson` sin errores.
  - Test admin ampliado para validar cambio de clase.

---

## Próximo plazo (siguiente bloque)

- Fecha objetivo: **2026-03-22**
- Objetivo principal:
  - Consolidar i18n completo moviendo textos de mock (GoalTracker/Payments/Messaging) a `src/locales/*.js`.
  - Añadir smoke tests de idioma para dashboard de estudiante (`sk/cz/es`).
  - Crear endpoint/resumen de métricas de bookings para Ester (confirmadas/canceladas/pendientes por rango).

### PRIORIDAD MEDIA — Backend endpoints faltantes

- [x] **Register endpoint** — crear usuario + UserProfile en backend ✅
  - POST `/api/auth/register/` con email, username, password, language_level ✅
  - Validación de username único, email único ✅
  - Crear UserProfile automáticamente ✅
  - _Estado: COMPLETADO_

- [x] **Update UserProfile endpoint** — editar nivel, bio, preferencias
  - PATCH `/api/users/profile/` con language_level, bio
  - Solo el usuario mismo puede editar su profile
  - _Estado: COMPLETADO_

---

---

## Fase 3 — Tareas futuras lejanas (NO tocar ahora)

- [ ] Integración de pagos (Stripe)
- [ ] Mensajería profesor-alumno
- [ ] Notificaciones por email
- [ ] PWA

---

## Orden recomendado para la próxima sesión

1. Reescribir `sk.js` — archivo por archivo, empezando por eslovaco
2. Reescribir `cz.js` — checo correcto, misma estructura que sk.js
3. Reescribir `es.js` — español, misma estructura
4. Integrar Setmore en `/tutoring-services` y `/booking-system`
5. Añadir React Helmet con meta tags en las páginas activas
6. Verificar build final y hacer deploy en Vercel

---

## Notas para el agente

- Trabajar **un archivo a la vez** — no mezclar cambios de locales con cambios de componentes
- Después de cada archivo de locale, verificar que el build sigue pasando con `npm run build`
- No crear servicios ni tipos de clase que no existen (ver ESTER.md)
- El precio es **siempre 20 €/clase** — no hay paquetes ni bonos
- Las clases son **solo online** — no mencionar Bratislava ni ninguna ciudad
