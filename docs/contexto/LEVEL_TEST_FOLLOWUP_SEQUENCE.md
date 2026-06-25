# Level Test Follow-up Sequence (D+1 / D+3 / D+7)

Objetivo: convertir leads del test de nivel en reservas (Setmore) con una secuencia breve de alta intencion.

## Activacion tecnica

- Trigger recomendado en MailerLite:
  - `followup_sequence == level_test_v1`
- Segmentacion adicional:
  - `followup_language` en `es|cz|sk`
  - `followup_bucket` en `starter|basic|intermediate|upper_intermediate|b2_ready`

Campos que ahora llegan desde backend para leads de test:

- `followup_sequence`
- `followup_language`
- `followup_bucket`
- `followup_d1_subject`
- `followup_d3_subject`
- `followup_d7_subject`
- `followup_d1_hook`
- `followup_d3_hook`
- `followup_d7_hook`

## Estructura de la automatizacion

1. Email D+1: Plan claro y accion inmediata.
2. Email D+3: Objecion principal + solucion concreta.
3. Email D+7: Cierre con urgencia suave + CTA final.

Regla recomendada: salir del flujo si hace click en reserva o si entra en etapa `booked|won`.

---

## ES - Copys

### D+1
Asunto: Tu plan de 4 semanas para avanzar en espanol
Preheader: Resultado claro, prioridades y siguiente paso recomendado.

Cuerpo (resumen):
- Recordatorio corto de nivel estimado y score.
- 3 prioridades para 4 semanas:
  - Semana 1: base + errores frecuentes.
  - Semana 2: conversacion guiada.
  - Semana 3-4: fluidez + automatizacion.
- CTA principal: Reservar clase de inicio.
- CTA secundario: Ver programas y precios.

### D+3
Asunto: El error #1 que frena tu progreso (y como evitarlo)
Preheader: No es falta de talento, es falta de sistema.

Cuerpo (resumen):
- Objecion: estudiar mucho sin hablar de forma estructurada.
- Solucion: bloques cortos de speaking + feedback inmediato.
- Micro-prueba social: alumnos con mejora visible en pocas semanas.
- CTA principal: Reservar clase.

### D+7
Asunto: Ultimo recordatorio: reserva tu plaza esta semana
Preheader: Cupos limitados para mantener calidad personalizada.

Cuerpo (resumen):
- Recordatorio final de recomendacion.
- Beneficio inmediato de empezar esta semana.
- Urgencia suave (capacidad limitada).
- CTA principal: Reservar ahora.
- CTA secundaria: Responder al correo con objetivo principal.

---

## CZ - Copys

### D+1
Predmet: Tvuj 4tydenni plan pro rychly posun ve spanelstine
Preheader: Jasny vysledek, priority a dalsi krok.

### D+3
Predmet: Nejcastejsi chyba, ktera brzdi pokrok (a jak ji odstranit)
Preheader: Neni to talentem, ale systemem.

### D+7
Predmet: Posledni pripomenuti: rezervuj si misto tento tyden
Preheader: Kapacita je omezena kvuli kvalite vyuky.

---

## SK - Copys

### D+1
Predmet: Tvoj 4-tyzdnovy plan pre rychly posun v spanielcine
Preheader: Jasny vysledok, priority a dalsi krok.

### D+3
Predmet: Najcastejsia chyba, ktora brzdi pokrok (a ako ju odstranit)
Preheader: Nie je to talentom, ale systemom.

### D+7
Predmet: Posledna pripomienka: rezervuj si miesto tento tyzden
Preheader: Kapacita je obmedzena, aby ostala kvalita vyucby vysoka.

---

## Recomendaciones UX/UI para emails

- Usar CTA principal unico por email (reserva).
- Mantener CTA secundario discreto (servicios o reply).
- 1 idea principal por email, maximo 120-160 palabras en bloque central.
- Boton visible arriba y repetido al final solo en D+7.
- Evitar parrafos largos; usar listas breves.

## Recomendaciones de medicion

- KPIs minimos:
  - Open rate
  - CTR CTA principal
  - Reply rate
  - Booking rate por email
- UTMs sugeridas:
  - `utm_source=email`
  - `utm_medium=crm`
  - `utm_campaign=level_test_es|cz|sk`
  - `utm_content=d1_booking|d3_booking|d7_booking`

## Nota operativa

Este documento define contenido y logica de secuencia. La ejecucion (timings, condiciones de salida, plantillas finales) se configura en MailerLite Automation usando los campos personalizados enviados por backend.
