# AGENT.md — Habluj Project Convention Guide

> Este archivo define las convenciones, stack, patrones y reglas que toda IA
> asistente de codigo DEBE respetar al trabajar en este proyecto.
> Ultima actualizacion: 2026-03-14

---

## LECTURA OBLIGATORIA ANTES DE EMPEZAR

Todo agente de IA que trabaje en este proyecto DEBE leer estos tres archivos
en orden antes de tocar cualquier codigo o contenido:

1. **`AGENT.md`** (este archivo) — Stack, estructura, convenciones de codigo
2. **`ESTER.md`** — Informacion real sobre Ester: bio, stats correctas,
   precios, lo que NO debe aparecer en la web, tono y voz
3. **`PLAN.md`** — Estado actual del proyecto, tareas completadas y
   proximos pasos priorizados

Si no has leido ESTER.md, no toques ningun locale ni ningun texto visible
al usuario. Si no has leido PLAN.md, no empieces a trabajar sin saber
en que punto esta el proyecto.

---

## 1. DEFINICION DEL PROYECTO

**Habluj** es una plataforma web de tutoria de espanol dirigida a hablantes
de eslovaco y checo. Ofrece una web informativa y de marketing para la profesora
Ester Mesároš (Bratislava, Eslovaquia), con sistema de reservas externo
(Setmore), paginas de servicios, contacto y soporte multilingue (SK/CZ/ES).

**Publico objetivo:** Pequena academia de idiomas (50-200 alumnos).
**Fase actual:** Web estatica informativa con booking externo.
**Fases futuras:** Dashboard de estudiantes con login y sistema de reservas propio.

---

## 2. STACK TECNOLOGICO

### Frontend (Principal)

| Categoria          | Tecnologia                    | Version  | Notas                          |
|--------------------|-------------------------------|----------|--------------------------------|
| Lenguaje           | JavaScript (JSX)              | ES2022+  | NO TypeScript                  |
| Framework          | React                         | 18.2.0   | Functional components + hooks  |
| Build              | Vite                          | 5.0.0    | Output en `build/`             |
| Routing            | React Router DOM              | 6.0.2    | BrowserRouter, rutas planas    |
| Estado             | Context API + useState        | -        | NO Redux (instalado, no usar)  |
| Estilos            | TailwindCSS                   | 3.4.6    | Con design system custom       |
| CSS Utilities      | clsx + tailwind-merge + CVA   | -        | Via `cn()` helper              |
| Iconos             | Lucide React                  | 0.484.0  | Via IconRegistry centralizado  |
| Animaciones        | Framer Motion                 | 10.16.4  | + CSS animations custom        |
| Formularios        | React Hook Form               | 7.55.0   | Para contact/booking forms     |
| SEO                | React Helmet                  | 6.1.0    | Meta tags por pagina           |
| Fechas             | date-fns                      | 4.1.0    | NO moment.js                   |
| Charts             | Recharts                      | 2.15.2   | Solo en dashboard (fase 2)     |
| UI Primitives      | Radix UI (react-slot)         | 1.2.3    | Base para componentes ui/      |

### Backend (Fase futura — NO activo)

| Categoria          | Tecnologia                    | Version  |
|--------------------|-------------------------------|----------|
| Framework          | Django                        | 5.0.0    |
| API                | Django REST Framework         | 3.14.0   |
| Base de datos      | SQLite (dev) / PostgreSQL     | -        |
| CORS               | django-cors-headers           | 4.3.0    |

### Despliegue

| Componente         | Plataforma                    |
|--------------------|-------------------------------|
| Frontend           | Vercel                        |
| Backend (futuro)   | Railway                       |
| Booking externo    | Setmore                       |

### Herramientas de desarrollo

- PostCSS + autoprefixer + cssnano (produccion)
- ESLint (react-app preset, configurado en package.json)
- Path aliases via jsconfig.json (baseUrl: "./src")
- Vite con manual chunk splitting (vendor, ui-libs, common)

---

## 3. ESTRUCTURA DE CARPETAS

```
Habluj/
├── index.html                     # Entry HTML (lang="sk")
├── package.json                   # Dependencias y scripts
├── vite.config.mjs                # Config de Vite
├── tailwind.config.js             # Design system extendido
├── postcss.config.js              # PostCSS plugins
├── jsconfig.json                  # Imports absolutos desde src/
├── .env                           # Variables VITE_CONTACT_*
├── .env.example                   # Template de variables
│
├── public/
│   ├── _redirects                 # SPA routing (Netlify/Vercel)
│   ├── favicon.ico
│   ├── manifest.json
│   ├── robots.txt
│   ├── fonts/                     # Inter, Source Sans Pro, Crimson Text
│   └── assets/images/             # Imagenes estaticas
│
├── src/
│   ├── index.jsx                  # Entry point React
│   ├── App.jsx                    # Root: LanguageProvider + Routes
│   ├── Routes.jsx                 # Definicion de todas las rutas
│   │
│   ├── components/                # Componentes compartidos/reutilizables
│   │   ├── ui/                    # Primitivos estilo shadcn/ui
│   │   │   ├── Button.jsx         # CVA variants, forwardRef
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Checkbox.jsx
│   │   │   └── Header.jsx         # Nav global + language switcher
│   │   ├── AppIcon.jsx            # Wrapper de iconos (usa IconRegistry)
│   │   ├── AppImage.jsx           # Lazy image con blur placeholder
│   │   ├── Carousel.jsx           # Carrusel de imagenes
│   │   ├── ErrorBoundary.jsx      # Error boundary global (class comp)
│   │   ├── ScrollToTop.jsx        # Scroll reset en cambio de ruta
│   │   └── IconRegistry.js        # Imports centralizados de lucide-react
│   │
│   ├── context/
│   │   └── LanguageContext.jsx    # i18n: idioma + traducciones dinamicas
│   │
│   ├── hooks/
│   │   └── useTranslation.js      # Hook que envuelve LanguageContext
│   │
│   ├── locales/                   # Archivos de traduccion (import dinamico)
│   │   ├── sk.js                  # Eslovaco (460+ claves)
│   │   ├── cz.js                  # Checo
│   │   └── es.js                  # Espanol
│   │
│   ├── pages/                     # Componentes a nivel de ruta
│   │   ├── homepage/
│   │   │   ├── index.jsx
│   │   │   └── components/        # HeroSection, Features, Testimonials...
│   │   ├── about-the-teacher/
│   │   │   ├── index.jsx
│   │   │   └── components/        # AboutHero, PersonalStory, Credentials...
│   │   ├── tutoring-services/
│   │   │   ├── index.jsx
│   │   │   └── components/        # ServiceCard, PricingTable, Calendar...
│   │   ├── booking-system/
│   │   │   ├── index.jsx
│   │   │   └── components/        # CalendarView, BookingForm, Packages...
│   │   ├── student-dashboard/     # (Fase 2 — datos mock actualmente)
│   │   │   ├── index.jsx
│   │   │   └── components/        # ProgressChart, LessonHistory, Goals...
│   │   ├── contact/
│   │   │   ├── index.jsx
│   │   │   └── components/        # ContactHero, ContactForm, FAQ...
│   │   └── NotFound.jsx
│   │
│   ├── styles/
│   │   ├── tailwind.css           # CSS variables, design tokens, components
│   │   ├── fonts.css              # @font-face declarations
│   │   └── index.css              # Base resets
│   │
│   └── utils/
│       ├── cn.js                  # clsx + twMerge utility
│       └── contactInfo.js         # Info de contacto desde env vars
│
└── backend/                       # (Fase futura — NO activo)
    ├── manage.py
    ├── requirements.txt
    ├── core/                      # Django settings, urls
    └── api/                       # Models, views, serializers
```

### Reglas de estructura

- Nuevas paginas: crear en src/pages/<nombre-kebab>/index.jsx con subcarpeta components/
- Componentes reutilizables: van en src/components/ o src/components/ui/
- Nuevos hooks: van en src/hooks/
- Nuevos contexts: van en src/context/
- Utilidades: van en src/utils/
- NUNCA crear archivos sueltos en src/ (excepto index.jsx, App.jsx, Routes.jsx)

---

## 4. MODELO DE DATOS

### Fase 1: Web estatica (actual)

No hay modelos persistentes. Los datos se definen como constantes
dentro de los componentes o archivos de traduccion.

Datos de contacto: vienen de variables de entorno via src/utils/contactInfo.js

    VITE_CONTACT_EMAIL=...
    VITE_CONTACT_WHATSAPP=...
    VITE_CONTACT_INSTAGRAM=...

Traducciones: objetos planos con claves dot-notation en src/locales/*.js

    // Ejemplo src/locales/sk.js
    export default {
      "hero.title": "Naucte sa spanielcinu...",
      "hero.subtitle": "Osobne lekcie...",
      "nav.home": "Domov",
      // ... 460+ claves
    }

### Fase 2: Backend con Django (futuro)

    +--------------+     +--------------+
    | UserProfile  |     |    Lesson    |
    +--------------+     +--------------+
    | user (FK)    |     | title        |
    | lang_level   |     | description  |
    | bio          |     | level (CEFR) |
    | created_at   |     | duration     |
    | updated_at   |     | price        |
    +------+-------+     +------+-------+
           |                    |
           |    +------------+  |
           +--->|  Booking   |<-+
                +------------+
                | student(FK)|
                | lesson(FK) |
                | date       |
                | time       |
                | status     |  pending|confirmed|cancelled|completed
                | notes      |
                +-----+------+
                      |
                +-----+------+
                |  Progress  |
                +------------+
                | student(FK)|
                | lesson(FK) |
                | completed  |
                | score      |
                | notes      |
                | completed_at|
                +------------+

    Niveles CEFR: A1 | A2 | B1 | B2 | C1 | C2
    Unique constraints:
      - Booking: (date, time)      — un slot por horario
      - Progress: (student, lesson) — un registro por alumno por leccion

---

## 5. DIAGRAMAS DE FLUJO

### 5.1 Navegacion principal

                    +-----------+
                    |  Usuario  |
                    | entra a / |
                    +-----+-----+
                          |
                    +-----+-----+
                    | About the | <- Landing page por defecto
                    |  Teacher  |
                    +-----+-----+
                          |
         +--------+-------+-------+--------+
         |        |       |       |        |
    +----+---+ +--+--+ +--+--+ +--+--+ +---+----+
    |Homepage| |Serv.| |Book.| |Dash.| |Contact |
    | /home  | |/tut.| |/book| |/std.| |/contact|
    +--------+ +--+--+ +--+--+ +-----+ +---+----+
                  |       |               |
                  |  +----+-----+         |
                  +->|  Setmore |<--------+
                     | (externo)|
                     +----------+

### 5.2 Flujo de reserva — Fase 1 (Setmore externo)

    +--------------+
    | /tutoring    |
    | -services    |
    +------+-------+
           |
    +------+-------+
    | Elige tipo   |
    | de servicio  |
    +------+-------+
           |
    +------+-------+     +-------------+
    | Click "Rezer-+---->|   Setmore   |
    | vovat" (CTA) |     | Widget/ext. |
    +--------------+     +------+------+
                                |
                         +------+------+
                         |Confirmacion |
                         | por email   |
                         +-------------+

### 5.3 Flujo de reserva — Fase 2 (Booking propio, futuro)

    +------------+
    | /booking   |
    | -system    |
    +-----+------+
          |
    +-----+------+
    | PASO 1:    |
    | Paquete    |
    +-----+------+
          |
    +-----+------+
    | PASO 2:    |
    | Fecha      |
    +-----+------+
          |
    +-----+------+
    | PASO 3:    |
    | Hora       |
    +-----+------+
          |
    +-----+------+
    | PASO 4:    |
    | Formulario |
    +-----+------+
          |
    +-----+------+     +----------+
    | POST /api/ +---->| Backend  |
    | bookings/  |     | Django   |
    +-----+------+     +----+-----+
          |                 |
    +-----+------+   +------+----+
    | Modal conf.|   | Email     |
    +------------+   +-----------+

### 5.4 Flujo de internacionalizacion (i18n)

    +--------------+
    | App.jsx      |
    | LanguageProv.|
    +------+-------+
           |
    +------+-------+
    | localStorage |
    | ('language') |
    +------+-------+
           |
      +----+----+
      |    |    |
    +-+-+ +-+-+ +-+-+
    |sk | |cz | |es |
    +-+-+ +-+-+ +-+-+
      |    |    |
    +-+----+----+-+
    | import()    |
    | dinamico    |
    | locales/X.js|
    +------+------+
           |
    +------+-------+
    | translations |
    | en Context   |
    +------+-------+
           |
    +------+-------+
    | useTranslat. |
    | hook         |
    +--------------+

### 5.5 Flujo de contacto

    +--------------+
    |  /contact    |
    +------+-------+
           |
    +------+-------+--------+
    |      |                |
    +--+---+ +----+   +-----+----+
    |WhatsApp| |Email|   |Instagram|
    | (ext.) | |(ext)|   | (ext.)  |
    +--------+ +-----+   +---------+
           |
    +------+-------+
    | Formulario   |
    | React Hook   |
    | Form         |
    +------+-------+
           |
    +------+-------+
    | Envio email  | <- EmailJS / Formspree / backend (por implementar)
    +--------------+

---

## 6. CONVENCIONES DE CODIGO

### 6.1 Nomenclatura de archivos

| Tipo                     | Convencion       | Ejemplo                      |
|--------------------------|------------------|------------------------------|
| Paginas (directorios)    | kebab-case       | about-the-teacher/           |
| Componentes (.jsx)       | PascalCase       | BookingForm.jsx              |
| Hooks (.js)              | camelCase + use  | useTranslation.js            |
| Utilidades (.js)         | camelCase        | contactInfo.js               |
| Contextos (.jsx)         | PascalCase       | LanguageContext.jsx          |
| Estilos (.css)           | kebab-case       | tailwind.css                 |
| Locales (.js)            | codigo idioma    | sk.js, cz.js, es.js          |

### 6.2 Nomenclatura de codigo

    // Componentes: PascalCase
    const BookingForm = () => { ... }

    // Hooks: camelCase con prefijo "use"
    const useTranslation = () => { ... }

    // Funciones: camelCase
    const handleSubmit = () => { ... }
    const formatDate = (date) => { ... }

    // Constantes: UPPER_SNAKE_CASE
    const MAX_BOOKINGS_PER_DAY = 8;
    const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    // Props: camelCase
    <Button iconName="Calendar" iconPosition="left" fullWidth />

    // CSS variables: --categoria-nombre
    --color-primary, --spacing-md, --timing-fast

    // Claves de traduccion: dot.notation.kebab
    "hero.title", "booking.step1.description"

### 6.3 Estructura interna de componentes

    import React from 'react';
    // 1. Imports de librerias externas
    // 2. Imports de componentes internos
    // 3. Imports de hooks
    // 4. Imports de utilidades

    const MiComponente = ({ prop1, prop2 }) => {
      // 5. Hooks (useState, useEffect, custom hooks)
      // 6. Variables derivadas / computadas
      // 7. Handlers / funciones internas
      // 8. Early returns (loading, error states)
      // 9. Return JSX
    };

    export default MiComponente;

### 6.4 Patron de componentes UI (shadcn/ui)

Los componentes en src/components/ui/ DEBEN seguir este patron:

    const variants = cva("clases-base", {
      variants: {
        variant: { default: "...", outline: "..." },
        size: { default: "...", sm: "...", lg: "..." }
      },
      defaultVariants: { variant: "default", size: "default" }
    });

    const MiComponente = React.forwardRef(({ className, variant, size, ...props }, ref) => (
      <elemento
        className={cn(variants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    ));

    MiComponente.displayName = "MiComponente";
    export default MiComponente;

### 6.5 Imports

    // CORRECTO: import absoluto desde src/
    import Button from 'components/ui/Button';
    import { cn } from 'utils/cn';

    // INCORRECTO: import relativo largo
    import Button from '../../../components/ui/Button';

    // EXCEPCION: imports relativos dentro de la misma feature
    import BookingForm from './BookingForm';

### 6.6 Estilos

    // CORRECTO: Tailwind con cn() para condicionales
    <div className={cn("p-4 rounded-lg bg-card", isActive && "ring-2 ring-primary", className)}>

    // CORRECTO: tokens del design system
    <div className="bg-primary text-primary-foreground shadow-warm">

    // INCORRECTO: estilos inline
    <div style={{ backgroundColor: 'orange' }}>

    // INCORRECTO: colores hardcodeados
    <div className="bg-[#C4622D]">   // usar bg-primary

### 6.7 Iconos

    // CORRECTO
    import Icon from 'components/AppIcon';
    <Icon name="Calendar" size={20} className="text-primary" />

    // INCORRECTO: importar directo de lucide-react
    import { Calendar } from 'lucide-react';

    // Para anadir icono nuevo: agregarlo a src/components/IconRegistry.js

### 6.8 Traducciones

    // CORRECTO
    const { t } = useTranslation();
    <h1>{t('hero.title')}</h1>

    // INCORRECTO: texto hardcodeado
    <h1>Aprende espanol</h1>

    // Al anadir texto nuevo:
    // 1. Agregar clave a sk.js, cz.js y es.js
    // 2. Usar convencion: "seccion.subseccion.elemento"

### 6.9 Formularios

    // Usar React Hook Form siempre
    const { register, handleSubmit, formState: { errors } } = useForm();

### 6.10 Animaciones

    // Framer Motion para entradas/salidas
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

    // CSS animations para loops continuos
    <div className="animate-bridge-flow">

    // NO usar setTimeout/setInterval para animaciones

---

## 7. PATRONES OBLIGATORIOS

### 7.1 Hacer SIEMPRE

- Usar cn() para combinar clases CSS condicionales
- Usar React.forwardRef en componentes UI reutilizables
- Agregar displayName en componentes con forwardRef
- Agregar traducciones a los 3 idiomas al crear texto nuevo
- Usar React Helmet para meta tags SEO en cada pagina
- Usar imports absolutos desde src/
- Usar los colores del design system (primary, secondary, accent, etc.)
- Usar fuentes definidas: headlines (Inter), body (Source Sans Pro), accent (Crimson Text)
- Manejar estados loading y error en todo flujo asincrono
- Respetar spacing Golden Ratio: xs=8px, sm=13px, md=21px, lg=34px, xl=55px
- Usar date-fns para manipulacion de fechas
- Disenar mobile-first y luego expandir con breakpoints

### 7.2 NO hacer NUNCA

- NO instalar dependencias nuevas sin justificacion documentada
- NO usar Redux/RTK (instalado pero NO se usa en este proyecto)
- NO usar TypeScript (proyecto en JavaScript puro)
- NO importar iconos directo de lucide-react (usar AppIcon + IconRegistry)
- NO hardcodear textos visibles al usuario (usar traducciones)
- NO hardcodear colores hex/rgb (usar tokens del design system)
- NO crear CSS modules ni styled-components
- NO usar var (siempre const o let)
- NO dejar console.log en codigo de produccion
- NO modificar archivos del backend en fase 1
- NO hacer fetch/axios calls en fase 1 (datos mock o servicios externos)
- NO crear class components (excepto ErrorBoundary ya existente)
- NO modificar la seccion rocketCritical de package.json

### 7.3 Responsive (mobile-first)

    Breakpoints:
      xs:  475px
      sm:  640px
      md:  768px
      lg:  1024px
      xl:  1280px
      2xl: 1536px

    Patron:
      <div className="px-4 md:px-8 lg:px-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

### 7.4 Accesibilidad minima

- Todos los <img> deben tener alt descriptivo (traducido)
- Botones sin texto visible deben tener aria-label
- Contraste WCAG AA (cubierto por el design system)
- Focus visible en elementos interactivos (configurado en Button.jsx)

---

## 8. RUTAS Y PAGINAS

| Ruta                  | Componente        | Estado   | Descripcion                      |
|-----------------------|-------------------|----------|----------------------------------|
| /                     | AboutTheTeacher   | Activa   | Landing page (redirect aqui)     |
| /homepage             | Homepage          | Activa   | Marketing: hero, features, CTA   |
| /about-the-teacher    | AboutTheTeacher   | Activa   | Bio, filosofia, credenciales     |
| /tutoring-services    | TutoringServices  | Activa   | Servicios, precios, CTA Setmore  |
| /booking-system       | BookingSystem     | Fase 2   | Booking multi-paso (mock ahora)  |
| /student-dashboard    | StudentDashboard  | Fase 2   | Dashboard alumno (mock ahora)    |
| /contact              | ContactPage       | Activa   | Contacto, formulario, FAQ        |
| *                     | Navigate to /     | Activa   | Catch-all redirect               |

---

## 9. VARIABLES DE ENTORNO

    # Frontend (.env) — prefijo VITE_ obligatorio para que Vite las exponga
    VITE_CONTACT_EMAIL=email@ejemplo.com
    VITE_CONTACT_WHATSAPP=+421XXXXXXXXX
    VITE_CONTACT_INSTAGRAM=@habluj

    # Backend (.env) — solo en fase 2
    DEBUG=True
    SECRET_KEY=...
    DATABASE_URL=sqlite:///db.sqlite3
    ALLOWED_HOSTS=localhost,127.0.0.1
    CORS_ORIGIN_WHITELIST=http://localhost:4028

REGLA: Nunca commitear .env al repositorio. Usar .env.example como template.

---

## 10. SCRIPTS DISPONIBLES

    npm start        # Servidor de desarrollo en http://localhost:4028
    npm run dev      # Alias de start
    npm run build    # Build de produccion en build/
    npm run serve    # Preview del build de produccion

---

## 11. ROADMAP DE FASES

### Fase 1 — Web estatica (ACTUAL)
- [x] Paginas informativas (home, about, services, contact)
- [ ] Integrar Setmore como sistema de reservas externo
- [ ] SEO: meta tags dinamicos, sitemap, Open Graph
- [ ] Testing: unit tests de componentes principales
- [ ] Optimizacion de rendimiento (lazy loading, code splitting)
- [ ] Deploy en Vercel

### Fase 2 — Dashboard y booking propio (FUTURO)
- [ ] Sistema de autenticacion (login/register)
- [ ] Conectar frontend al backend Django
- [ ] Dashboard funcional con datos reales
- [ ] Sistema de booking integrado
- [ ] Deploy backend en Railway

### Fase 3 — Funcionalidades avanzadas (FUTURO LEJANO)
- [ ] Sistema de pagos (Stripe)
- [ ] Mensajeria profesor-alumno
- [ ] Notificaciones por email
- [ ] PWA (Progressive Web App)
