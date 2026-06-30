import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Solo el panel de administración requiere sesión. El resto del sitio
// (dashboard, reportes, incidentes) es público: es información para la comunidad.
const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Salta archivos internos de Next y estáticos
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Siempre corre en rutas de API
    "/(api|trpc)(.*)",
  ],
};
