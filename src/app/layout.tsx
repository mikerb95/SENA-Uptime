import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Activity } from "lucide-react";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SENA UpTime — Estado de los Servicios",
  description:
    "Monitoreo en tiempo real de los servicios digitales del SENA Colombia. Verifica el estado de Sofía Plus, portales institucionales y más.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${geist.className} min-h-screen bg-background text-foreground antialiased`}>
        <TooltipProvider>
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-bold text-base">
                <Activity className="h-5 w-5 text-emerald-600" />
                SENA UpTime
              </Link>
              <nav className="flex items-center gap-5 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground transition-colors">
                  Servicios
                </Link>
                <Link href="/incidents" className="hover:text-foreground transition-colors">
                  Incidentes
                </Link>
              </nav>
            </div>
          </header>

          <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>

          <Separator />
          <footer className="max-w-5xl mx-auto px-4 py-6 text-xs text-muted-foreground flex items-center justify-between">
            <span>SENA UpTime — Proyecto Open Source</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </footer>
        </TooltipProvider>
      </body>
    </html>
  );
}
