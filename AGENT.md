# Guía de agentes para Habluj

Esta guía resume las convenciones que un agente debe seguir al trabajar en el
repositorio. La documentación enlazada es la fuente de verdad para el negocio,
el estado del proyecto y el despliegue; no copies su contenido aquí.

## Antes de editar

1. Lee [README.md](README.md) para los comandos, rutas públicas y operación.
2. Lee [docs/contexto/ESTER.md](docs/contexto/ESTER.md) antes de modificar
   locales o texto visible. Sus datos y restricciones de contenido son
   obligatorios.
3. Lee [docs/contexto/PLAN.md](docs/contexto/PLAN.md) para conocer el estado y
   las prioridades actuales.
4. Consulta la documentación específica de `docs/` o `Manus docs/` cuando el
   cambio afecte producto, CRO, SEO o comercialización.

## Estado y arquitectura

- El frontend React/Vite está activo y se despliega en Vercel. El build se
  genera en `build/`.
- El backend Django/DRF está activo en `backend/` y se despliega en
  PythonAnywhere. Incluye autenticación, reservas, leads, dashboard y
  endpoints administrativos.
- El frontend usa rutas canónicas localizadas: `/:lang/...`, donde los
  segmentos soportados son `sk`, `cs` y `es`. Las rutas antiguas sin idioma
  redirigen; comprueba [src/Routes.jsx](src/Routes.jsx) antes de añadir rutas.
- `src/App.jsx` compone el proveedor de idioma y las rutas. Las páginas viven
  en `src/pages/`; los componentes compartidos en `src/components/` y sus
  primitivos en `src/components/ui/`.
- El idioma se gestiona con `LanguageContext` y `useTranslation`; las
  traducciones están en `src/locales/`.
- Los pagos del proyecto usan Stripe de momento. No introduzcas referencias ni
  integraciones con otras pasarelas, hasta que no te diga lo contrario.
- La reserva pública vigente usa Setmore mientras el plan no indique lo
  contrario. El backend ya contiene la base de reservas y pagos futuros; no
  asumas que está desactivado solo porque una funcionalidad siga en backlog.

## Convenciones de código

- JavaScript/JSX, sin TypeScript. Usa componentes funcionales y hooks.
- Componentes en PascalCase; hooks y utilidades en camelCase; carpetas de
  páginas en kebab-case.
- Una página nueva va en `src/pages/<nombre-kebab>/index.jsx`; sus piezas
  específicas van en `components/` dentro de esa página.
- Prefiere imports absolutos desde `src/` (`components/...`, `utils/...`).
  Usa imports relativos solo dentro de la misma feature cuando sean claros.
- Usa `cn()` para clases condicionales y los tokens del design system de
  Tailwind. Evita estilos inline y colores hardcodeados.
- Usa `AppIcon` y el registro central de iconos en lugar de importar iconos
  directamente desde `lucide-react`.
- Todo texto visible debe pasar por `useTranslation()`. Al añadir copy,
  actualiza `src/locales/sk.js`, `src/locales/cz.js` y `src/locales/es.js`.
- No inventes datos de Ester, precios, credenciales, ubicaciones ni servicios.
  Ante una contradicción, prevalecen `ESTER.md` y el producto implementado;
  pregunta si el cambio requiere una decisión de negocio.

## Backend y contratos

- Los endpoints y permisos se definen en `backend/api/` y se registran en
  [backend/core/urls.py](backend/core/urls.py). Revisa serializers, views,
  modelos y tests juntos cuando cambies un contrato.
- Mantén validaciones, throttling, CSRF/CORS, autenticación y verificación de
  webhooks al modificar la API. No expongas secretos ni uses valores de
  producción en el código.
- Respeta los límites y extensiones de subida configurados por entorno.
- Para cambios que crucen frontend y backend, documenta las variables de
  entorno requeridas en README si todavía no están descritas.

## Validación y comandos

No levantes servidores ni ejecutes tests, builds o comprobaciones de backend
automáticamente. Hazlo solo si el usuario lo pide explícitamente o si indica
qué comando debe ejecutarse.

Cuando se solicite validación, usa el alcance más estrecho posible:

- Frontend: `npm run test -- --run` y `npm run build` según el cambio.
- Backend: desde `backend/`, `python manage.py test`.
- Seguridad y validación integrada: `bash scripts/verify-dashboard-security.sh`.
- Smoke tras un despliegue solicitado: `bash scripts/post_deploy_smoke.sh`.
- Desarrollo conjunto, solo bajo petición: `bash scripts/dev-up.sh`.

No afirmes que algo está desplegado sin verificar la rama, el contenido y la
URL pública real. No hagas commits ni cambies de rama salvo petición expresa.

## Alcance de los cambios

- Inspecciona primero el archivo, símbolo, test o script más cercano al
  comportamiento solicitado.
- Haz cambios pequeños y evita refactors no relacionados.
- No reviertas cambios existentes del usuario.
- Añade o ajusta tests cuando el cambio altere una conducta verificable, pero
  no arregles fallos ajenos al alcance.
- Mantén documentación y código coherentes; enlaza documentación existente en
  vez de duplicarla.
