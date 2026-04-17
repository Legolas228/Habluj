# PLAN.md — Plan de trabajo del proyecto Habluj

> Fuente de verdad del estado operativo y próximos pasos.
> Actualizar al cerrar cada PR relevante.
> Última actualización: 2026-04-17 (Quick Wins CRO completados)

---

---

## Archivos de referencia obligatorios

- `AGENT.md` — Convenciones técnicas y de trabajo.
- `docs/contexto/ESTER.md` — Datos reales de negocio, tono y restricciones de contenido.
- `Contexto General del Proyecto .markdown` — Directrices estratégicas de producto, localización y crecimiento.
- **`Manus docs/` (auditorías y planes):**
  - `Informe de Auditoría CRO y UX Writing para Habluj` — Análisis de fricción, quick wins, test A/B hipótesis.
  - `Plan Maestro de Comercialización - Lanzamiento Intensivos y Grupos Habluj` — Estrategia "efecto escaparate", pre-venta, referidos, cronograma.
  - `Plan Táctico de Matchmaking y Ventas - Intensivos Flexibles Habluj` — Google Form segmentación, protocolos cierre, scripts Ester.

---

## Estado actual (resumen)

- Frontend (React/Vite): activo en producción con i18n `sk/cz/es`.
- Backend (Django/DRF): activo en producción con auth, bookings, leads y admin.
- Deploy: operativo (Vercel + PythonAnywhere).
- Seguridad y SEO técnico: endurecidos y mejorados en iteraciones recientes.

---

## Completado recientemente (compactado)

- Hardening backend: throttling/scopes, lockout progresivo, validaciones upload/payload, confirmación de pago segura.
- Cobertura de tests backend ampliada en lockout y confirmación de pago.
- Ajustes de pricing/i18n y limpieza de contenido frontend.
- Mejoras SEO (canonical/hreflang/schema/OG), redirects edge preparados y smoke checks ejecutados.
- Higiene de repositorio y reorganización de documentación de contexto.

---

## Quick Wins CRO (implementación inmediata - Auditoría Manus de 15-04-2026)

Recomendaciones concretas del análisis CRO/UX Writing:

- [x] **Hero Section CTA:** Reducir de 3 CTAs a 1 CTA principal (primario "Reserva tu Clase" + secundario "Test de Nivel"). **Status:** ✅ HECHO - Un único CTA prominente con link secundario.
- [x] **Test de Nivel como Lead Magnet:** Transformar a experiencia multi-step (1 pregunta/pantalla, barra de progreso, captura email). **Status:** ✅ HECHO - Quiz → Resultado → Contact form → Success con progreso visual.
- [x] **Copy del Hero (Pain Points CZ/SK):** Cambiar títulos genéricos por narrativas resonantes. **Status:** ✅ HECHO (17-04-2026) - SK: "Španielčina bez strachu z rozprávmania" | CZ: "Španělština bez strachu z mluvení" | ES: "Español sin miedo a hablar" + subtítulos con énfasis en lectorka local.
- [x] **Foto de la Profesora (Ester):** Integrada en "About the Teacher" prominentemente. **Status:** ✅ HECHO - Página dedicada con hero image, floating quote card, y stats. Considerar duplicar en Hero section de homepage como mejora UX.
- [ ] **Coherencia de Marca en Setmore:** Investigar personalización de plataforma o migración a motor nativo para evitar cambio de dominio.  **Status:** 🔄 INVESTIGANDO - Evaluar opciones post-MVP.

---

## Backlog integrado (priorizado por carriles paralelos)

### Carril A — Producto y conversión (prioridad de negocio)

- [ ] Reemplazar Setmore por motor de reservas nativo end-to-end.
- [ ] Completar pagos GoPay reales (init/confirm/webhook) y enlazar compra de créditos.
- [ ] Exponer saldo/movimientos de créditos y estados de reservas/pagos en dashboard alumno.
- [ ] Garantizar política de cancelación 24h en reglas backend y avisos UX.
- [ ] Aplicar pricing dual EUR/CZK con redondeo psicológico a múltiplos de 10.
- [ ] Reforzar Hero con CTA único, confianza local CZ/SK y test de nivel como lead magnet.
- [ ] Extender automatizaciones de MailerLite y robustecer Google Calendar/Meet.
- [ ] **Lanzamiento de Intensivos Flexibles (Julio-Agosto):** Implementar matchmaking y flujo de pre-venta con Google Form + cierre manual (Ester).
- [ ] **Lanzamiento de Grupos de Octubre:** Pre-venta Early Bird con combo intensivo+grupo (15% descuento + taller bonus).
- [ ] Definir e implementar matchmaking base para intensivos flexibles.

### Carril B — Estabilización técnica y operación

- [ ] Configurar/verificar `VITE_SITE_URL` (Production/Preview).
- [ ] Deploy y verificación de redirects `3xx` hacia rutas canónicas.
- [ ] Auditoría SEO final con Lighthouse CLI y cierre de warnings críticos.
- [ ] Aplicar/verificar migraciones Django pendientes.
- [ ] Re-ejecutar smoke post-deploy y guardar evidencia en documentación.
- [ ] Añadir pruebas de seguridad para límites de subida y throttling scopes.
- [ ] Consolidar runbook en `README.md` (deploy + rollback).

---

## Dependencias y sincronización

- Los dos carriles avanzan en paralelo.
- Solo se bloquea Carril A si hay incidencias críticas de disponibilidad/seguridad en Carril B.
- Antes de cierre global: validación integrada de reservas, pagos, créditos, i18n, SEO y operación.

---

## Cierre por hitos

- Hito 1: reserva nativa + GoPay funcionales.
- Hito 2: localización/CRO y automatizaciones esenciales cerradas.
- Hito 3: estabilización operativa completa con evidencia.

---

## Plan Maestro: Intensivos Flexibles y Grupos (Julio-Octubre 2026)

**Docs principales en `Manus docs/`:**
- `Plan Maestro de Comercialización - Lanzamiento Intensivos y Grupos Habluj`
- `Plan Táctico de Matchmaking y Ventas - Intensivos Flexibles Habluj`

### Fase 1: Lanzamiento Intensivos Flexibles (Julio - 8 semanas desde 13 abril)

**Valor diferencial:** "Tú pones la fecha, nosotros el grupo" — flexibilidad como ventaja exclusiva (no como falta de estructura).

**Producto:** 8 lecciones × 100 min, 4x/semana durante 2 semanas, horarios seleccionables por alumno. Precio: 149€. Grupos 4-6 alumnos por nivel.

**Mecánica de Matchmaking:**
- Google Form recopila: nivel (A0-B1), quincena preferida, franja horaria (mañana/mediodía/tarde/noche), prioridad (fecha vs. nivel vs. ambas).
- Ester cierra manualmente cuando hay 4 alumnos alojables en mismo horario/nivel.
- Email de confirmación genera urgencia (pago en 24h).

**Marketing (Redes/Social):**
- Cronograma "Bombardeo" de 8 semanas: temática semanal (lanzamiento → flexibilidad → desmitificación → testimonios → metodología → referidos → Early Bird Octubre). 
- Formatos: Reels, Stories, Carruseles con copy localizado SK/CZ.
- CTA: Link en BIO → Google Form Intensivos.

**Dinámicas de Conversión:**
- *Referidos:* Dos alumnos que se apunten juntos → descuento 10€ cada uno (precio 139€).
- *Early Bird Octubre:* Alumnos de intensivo que reserven grupo octubre antes del 30 jun → 15% descuento + taller 90 min gratis ("Mantén tu español en verano").

### Fase 2: Pre-venta Grupos Octubre (finales junio - 30 junio)

**Producto:** Ciclos de 8 semanas por nivel, 1-2 clases/semana, grupos 4-6 alumnos.

**Oferta Cruzada:** Paquete intensivo julio + grupo octubre con descuentos escalonados (ver Plan Maestro para detalles).

**Cierre Manual:** Scripts de venta SK/CZ de Ester con urgencia y escasez ("primeras 4 grupos que se llenen").

---

## Métricas Clave a Monitorear

(Referencia: `Plan Maestro...` Sección 6)

- **Tasa de Relleno del Google Form:** Formularios completados vs. visitas.
- **Tasa de Conversión Intensivos:** Alumnos inscritos/pagados vs. formularios completados.
- **Tasa de Conversión Early Bird Octubre:** Alumnos del intensivo que reservan grupo octubre.
- **CAC (Cost of Acquisition):** Inversión marketing / clientes nuevos.
- **Tasa de Referidos:** % de alumnos inscritos via "Trae a un amigo".
- **Engagement Redes Sociales:** Alcance, impresiones, clicks en link BIO.
- **Tiempo desde Confirmación hasta Pago:** KPI de urgencia (meta < 24h).

---

## Criterios de mantenimiento del plan

- Sin duplicados entre completado y pendiente.
- Mantener tareas accionables y trazables por PR.
- Respetar siempre `docs/contexto/ESTER.md` en contenido de negocio visible.
- Mantener GoPay como pasarela por defecto en código y documentación.
- No introducir migración a Next.js en esta fase salvo decisión explícita posterior.
