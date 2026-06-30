# SENA UpTime

**Auditoría externa e independiente de los servicios digitales del SENA Colombia.**

No somos el SENA. Somos una herramienta de la comunidad educativa que mide —desde afuera y en tiempo real— si las plataformas del SENA están funcionando, y publica esa evidencia para que aprendices, instructores y aspirantes tengan información valiosa cuando más la necesitan.

> Piensa en un "UptimeRobot del SENA" con foco en los momentos que de verdad importan, como las **ventanas de inscripción** de Sofía Plus.

---

## ¿Qué hace hoy?

- 📊 **Monitorea** los servicios del SENA (Portal, Sofía Plus, Blackboard, Empleo, etc.) cada 5 minutos.
- 🟢 **Dashboard en vivo** con el estado de cada servicio (operativo / degradado / caído).
- 📅 **Ventanas de inscripción**: avisa si la plataforma está disponible *durante* los periodos de inscripción y audita cuánto estuvo caída en ese lapso.
- 📈 **Reportes SLA mensuales** (`/reportes`): evidencia histórica de disponibilidad por servicio.
- 🛠️ **Panel admin** (`/admin/ventanas`) para gestionar las ventanas de inscripción.

---

## Stack

| Capa        | Tecnología                                  |
| ----------- | ------------------------------------------- |
| Framework   | **Next.js 16** (App Router, Server Components) |
| Lenguaje    | TypeScript                                  |
| Estilos     | Tailwind CSS + shadcn/ui                     |
| Base de datos | PostgreSQL (Neon) vía **Prisma 7** (adapter-pg) |
| Hosting     | Vercel (incluye el cron de monitoreo)       |

> ⚠️ **Ojo:** este Next.js es la versión 16, con cambios respecto a versiones anteriores. Antes de escribir código, revisa la guía relevante en `node_modules/next/dist/docs/`. No asumas APIs viejas.

---

## Cómo levantarlo en tu máquina

**Requisitos:** Node.js 20+ y una base de datos PostgreSQL (puedes crear una gratis en [Neon](https://neon.tech)).

```bash
# 1. Clona e instala
git clone <url-del-repo>
cd SenaUpTime
npm install

# 2. Configura el entorno
cp .env.example .env
#    Edita .env y pon tu DATABASE_URL real de Neon y un CRON_SECRET aleatorio.
#    Para el panel admin necesitas claves de Clerk (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
#    y CLERK_SECRET_KEY) — créalas gratis en https://clerk.com — y tu correo en ADMIN_EMAILS.

# 3. Crea las tablas en tu base de datos
npm run db:push

# 4. Arranca
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

**Para tener datos de prueba** (monitores + una ventana de ejemplo):

```bash
curl -X POST http://localhost:3000/api/seed
```

> El uptime y los reportes SLA se llenan con el tiempo: necesitan que el cron acumule chequeos. Al principio verás "—" hasta que haya datos suficientes.

---

## Estructura del proyecto

```
prisma/
  schema.prisma            # Modelos: Monitor, Check, Incident, InscriptionWindow
src/
  app/
    page.tsx               # Dashboard principal
    incidents/             # Historial de incidentes
    reportes/              # Reportes SLA mensuales
    services/[id]/         # Detalle de un servicio
    admin/ventanas/        # Panel admin de ventanas de inscripción
    api/
      cron/check/          # Endpoint que el cron llama cada 5 min
      seed/                # Datos de prueba (solo en desarrollo)
  components/
    monitors/              # Tarjetas, badges, barras de uptime...
    ui/                    # Componentes base de shadcn/ui
  lib/
    prisma.ts              # Cliente Prisma (singleton)
    monitors.ts            # Lista de servicios + lógica de ping y stats
    sla.ts                 # Cálculo de reportes SLA
    inscription-windows.ts # Lógica de ventanas de inscripción
```

### Cómo funciona el monitoreo

1. Un **cron de Vercel** llama a `/api/cron/check` cada 5 minutos (protegido con `CRON_SECRET`).
2. Ese endpoint hace ping a cada `Monitor` y guarda un `Check` (estado + latencia).
3. Si un servicio pasa a caído, se abre un `Incident`; cuando se recupera, se cierra.
4. Las páginas (`/`, `/reportes`, etc.) leen y agregan esos `Check` para mostrar el estado y las estadísticas.

---

## Cómo aportar 🙌

Toda ayuda es bienvenida. No necesitas ser experto: hay tareas de todos los niveles.

### Flujo de trabajo

1. Crea una rama desde `main`: `git checkout -b feat/mi-aporte`
2. Haz tus cambios.
3. Antes de subir, verifica que todo compila:
   ```bash
   npx tsc --noEmit   # sin errores de tipos
   npm run lint       # sin errores de lint
   ```
4. Haz commit y abre un Pull Request describiendo qué hiciste.

### Convenciones del proyecto

- **Idioma:** la interfaz y los textos van en **español**.
- **Componentes:** por defecto son Server Components. Usa `"use client"` solo si necesitas interactividad en el navegador.
- **Datos:** accede a la base de datos siempre con el singleton `prisma` de `src/lib/prisma.ts`.
- **Estilos:** Tailwind + componentes de `src/components/ui/`. Reusa lo que ya existe antes de crear algo nuevo.
- **Patrón de páginas:** mira `src/app/page.tsx` como referencia (Server Component con `revalidate` y manejo tolerante a "BD no configurada").

### Ideas para contribuir

**Fáciles (buen primer aporte):**
- Agregar más servicios del SENA a monitorear (en `src/lib/monitors.ts`).
- Mejorar textos, accesibilidad o el diseño de alguna página.
- Gráficas de latencia en el tiempo en la página de detalle.

**Intermedias:**
- Reportes ciudadanos: que la comunidad reporte "a mí también se me cayó".
- Notificaciones cuando abre una ventana de inscripción.
- Módulo de calificación de instructores y centros de formación.

**Avanzadas:**
- Scraping de la oferta educativa (cupos disponibles por centro/regional).
- Roles de administrador en Clerk (en vez de la lista blanca `ADMIN_EMAILS`).

¿Tienes otra idea? Ábrela como *issue* y la conversamos. 💚

---

## Variables de entorno

| Variable        | Para qué sirve                                            |
| --------------- | -------------------------------------------------------- |
| `DATABASE_URL`  | Cadena de conexión a PostgreSQL (Neon).                  |
| `CRON_SECRET`   | Protege el endpoint del cron `/api/cron/check`.          |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clave pública de Clerk (auth).       |
| `CLERK_SECRET_KEY` | Clave secreta de Clerk (auth).                        |
| `ADMIN_EMAILS`  | Correos con permiso de administrador (separados por comas). |

---

Proyecto **open source** de y para la comunidad educativa del SENA.
