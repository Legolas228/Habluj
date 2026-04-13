# PLAN.md — Plan de trabajo del proyecto Habluj

> Fuente de verdad del estado operativo y próximos pasos.
> Actualizar al cerrar cada bloque relevante.
> Última actualización: 2026-04-13

---

## Archivos de referencia obligatorios

- `AGENT.md` — Convenciones técnicas y de trabajo.
- `docs/contexto/ESTER.md` — Datos reales de negocio, tono y restricciones de contenido.

---

## Estado actual (resumen real)

| Área | Estado | Nota |
|---|---|---|
| Frontend (React/Vite) | Activo en producción | Multiidioma `sk/cz/es` funcionando |
| Backend (Django/DRF) | Activo en producción | Auth, bookings, leads y panel admin funcionales |
| Deploy | Operativo | Front en Vercel, API en PythonAnywhere |
| Seguridad API | Endurecida | Throttling, lockout progresivo, validación uploads |
| SEO técnico | Mejorado | Canonical/hreflang configurables y schema ampliado |

---

## Completado recientemente

- [x] Hardening de seguridad backend:
  - throttling global + scopes (`lead_create`, `gopay_webhook`)
  - lockout progresivo por IP en login/register
  - límites de payload/upload y validaciones de tipo/extensión/tamaño
  - confirmación de pago cliente en modo seguro (espera webhook firmado)
- [x] Cobertura de tests backend ampliada para lockout y confirmación de pago.
- [x] Ajustes de pricing/i18n:
  - clases grupales desde `150 € / curso`
  - checo en coronas: `od 3 750 Kč / kurz`
- [x] Limpieza de contenido frontend:
  - retiradas referencias a IA y app móvil
  - eliminados bloques CTA no deseados en homepage/about
- [x] SEO frontend:
  - OG/Twitter tags reforzados
  - schema de servicios con `AggregateOffer`
  - `VITE_SITE_URL` para canonical/hreflang consistentes por entorno
- [x] Smoke checks de producción sin Unlighthouse:
  - verificación HTTP de rutas canónicas `/sk|/cs|/es` y páginas clave (200)
  - comprobación de API root y login validation (200/400 esperado)
- [x] SEO edge preparado:
  - redirecciones permanentes de rutas legacy a rutas canónicas `/sk/...` en `vercel.json`
- [x] Higiene de repositorio:
  - eliminados archivos obsoletos versionados (`backend/db.sqlite3`, `backend/env`, PDFs innecesarios)
  - `.gitignore` actualizado para evitar reintroducir artefactos locales
  - documentación de contexto movida a `docs/contexto/`

---

## Backlog vigente (priorizado)

### Prioridad alta

- [ ] Configurar y verificar `VITE_SITE_URL` en Vercel (Production y Preview).
- [ ] Ejecutar auditoría SEO final con Lighthouse CLI por rutas críticas (sin Unlighthouse) y cerrar warnings de dominio/hreflang.
- [ ] Deploy para aplicar redirects 308 de `vercel.json` y verificar respuestas `3xx -> /sk/...`.
- [ ] Aplicar y verificar migraciones pendientes de Django en el entorno correspondiente.

### Prioridad media

- [ ] Re-ejecutar smoke post-deploy tras aplicar redirects de edge y guardar evidencia en docs.
- [ ] Añadir pruebas específicas de seguridad para límites de subida y scopes de throttling.
- [ ] Consolidar docs de operación en `README.md` (runbook único de deploy + rollback).

### Prioridad baja

- [ ] Revisar optimización de imágenes grandes en `public/assets/images/monuments`.
- [ ] Evaluar siguiente fase funcional (mensajería/notificaciones) solo tras estabilización de operación.

---

## Criterios de mantenimiento del plan

- Eliminar tareas cerradas antiguas que ya no aporten decisión.
- Evitar duplicados entre "completado" y "pendiente".
- Mantener solo trabajo accionable para el siguiente bloque.
- Respetar siempre `docs/contexto/ESTER.md` para cualquier texto visible de negocio.
