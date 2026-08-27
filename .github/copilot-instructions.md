# Instrucciones de Copilot para Habluj

- Lee `AGENT.md`, `README.md`, `docs/contexto/ESTER.md` y `docs/contexto/PLAN.md`
	antes de editar; sigue sus responsabilidades y fuentes de verdad.
- No levantes backend/frontend ni ejecutes tests, builds o comprobaciones de
	despliegue automáticamente. Hazlo solo por petición explícita del usuario.
- Mantén Stripe como única pasarela de pago en código y documentación. No
	introduzcas referencias a otras pasarelas.
- No inventes datos de Ester, precios, credenciales, ubicaciones o servicios;
	consulta `docs/contexto/ESTER.md`.
