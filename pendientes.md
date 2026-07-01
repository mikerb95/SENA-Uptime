# Pendientes — SenaUpTime

> Estado del despliegue en Vercel y tareas que faltan para dejar el proyecto
> funcionando en producción. Última actualización: 2026-06-30.

## Resumen rápido

El sitio **ya está desplegado** en producción, pero **está caído (error 500)**
porque el middleware de Clerk no tiene llaves reales configuradas.

- **URL de producción:** https://sena-uptime.vercel.app
- **Proyecto Vercel:** `codebymike/sena-uptime` (plan Hobby / gratis)
- **Repo:** https://github.com/mikerb95/SENA-Uptime (rama `main`)

---

## Lo que YA se hizo ✅

1. **Deploy a producción funcionando.** Se desplegó vía CLI (`vercel --prod`).
   El deploy llega a estado `READY`.

2. **Cron incompatible con plan gratis → resuelto.**
   `vercel.json` tenía un cron `*/5 * * * *` (cada 5 min), pero el plan Hobby
   solo permite crons **1 vez al día**. Eso hacía **fallar todos los deploys**.
   - Acción tomada: se vació `vercel.json` (`{}`), quitando el cron.
   - Pendiente relacionado: reactivar el monitoreo con un cron externo gratis
     (ver sección "Pendientes").

3. **`CRON_SECRET` estaba vacío → resuelto.**
   La variable existía en Vercel pero con valor `""` (inseguro).
   - Acción tomada: se generó un secreto fuerte y se guardó en Vercel
     (Production). Valor generado:
     `6020a6c745685180e7380b8c45ac768cd14773c6a83ace5b57decd2a8cf7fa45`
     (guardado también en el scratchpad de la sesión). Si se quiere, rotar luego.

---

## El BLOQUEO actual 🔴

**El middleware de Clerk falla en TODAS las rutas** (`MIDDLEWARE_INVOCATION_FAILED`,
HTTP 500), incluido el endpoint del cron `/api/cron/check`.

**Causa:** Clerk se agregó al código (`src/middleware.ts`) pero **nunca se
provisionó con llaves reales**. En producción NO existen las variables de Clerk,
y `.env.example` solo tiene placeholders (`pk_test_...`, `sk_test_...`).

Como `clerkMiddleware` corre en `/(api|trpc)(.*)` y en casi todo el sitio,
sin llaves válidas **todo el sitio devuelve 500**.

---

## PENDIENTES (lo que falta para que funcione) 📋

### 1. Crear cuenta de Clerk (GRATIS) — PENDIENTE, requiere acción del usuario
Clerk tiene plan gratis (hasta 10.000 usuarios/mes).

- [ ] Entrar a https://clerk.com y crear cuenta (con GitHub o `0368dev@gmail.com`).
- [ ] Crear una aplicación (ej: "SenaUpTime"), activar login por **Email**.
- [ ] Copiar las 2 llaves de la pantalla "API Keys":
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → `pk_test_...`
  - `CLERK_SECRET_KEY` → `sk_test_...`
- [ ] Pasarle las llaves a Claude (o subirlas tú a Vercel).

### 2. Subir llaves de Clerk a Vercel producción — PENDIENTE (bloqueado por #1)
Variables a crear en Vercel (Production):
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/sign-in`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL` = `/sign-up`
- [ ] `ADMIN_EMAILS` = correo(s) con permiso al panel `/admin`
- [ ] Redesplegar (`vercel --prod`) para que tome las variables.

### 3. Verificar que el sitio responde 200 — PENDIENTE (bloqueado por #2)
- [ ] Sitio principal carga sin 500.
- [ ] `GET /api/cron/check` con header `Authorization: Bearer <CRON_SECRET>`
      devuelve 200 (no 401 ni 500).
- [ ] Panel `/admin` pide login (protegido por Clerk).

### 4. Reactivar el monitoreo automático (cron) GRATIS — PENDIENTE
El plan Hobby no permite cron cada 5 min. Alternativa gratis: cron externo que
llame al endpoint. Opciones:
- **cron-job.org** (gratis, hasta cada 1 min) ← recomendado
- **UptimeRobot** (gratis, cada 5 min)
- **GitHub Actions** (`schedule` en un workflow)

Configurar el servicio para hacer cada 5 min:
```
GET https://sena-uptime.vercel.app/api/cron/check
Header: Authorization: Bearer <CRON_SECRET>
```
- [ ] Crear cuenta en el servicio de cron elegido.
- [ ] Configurar la petición con el header del secreto.
- [ ] Confirmar que se están registrando checks en la base de datos.

### 5. (Opcional) Conectar el repo de GitHub para auto-deploy — PENDIENTE
Hoy los deploys se hacen manualmente por CLI. Para que cada `push` a `main`
despliegue solo:
- [ ] En Vercel → Settings → Git, conectar `mikerb95/SENA-Uptime`.
- [ ] Production Branch = `main`.

### 6. (Opcional) Verificar `DATABASE_URL` en producción — PENDIENTE
- [ ] Confirmar que la base de datos PostgreSQL está configurada y accesible
      desde producción (necesaria para que el cron guarde los checks).

---

## Notas
- Todos los pasos que faltan son **gratis** (Clerk free tier + cron externo free
  + Vercel Hobby).
- El único bloqueo real ahora mismo es **crear la cuenta de Clerk** (pendiente #1).
  Todo lo demás lo puede hacer Claude una vez existan las llaves.
