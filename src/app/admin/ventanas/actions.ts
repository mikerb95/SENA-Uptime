"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";

const PATH = "/admin/ventanas";

/**
 * Autorización de administrador. Clerk autentica (quién eres); aquí decidimos
 * quién puede administrar comparando el correo contra la lista blanca
 * `ADMIN_EMAILS` (separada por comas). Más adelante puede migrarse a roles de
 * Clerk si se necesita algo más granular.
 */
export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allow.length === 0) return false;

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  return !!email && allow.includes(email);
}

export async function createWindow(formData: FormData) {
  if (!(await isAdmin())) return;

  const monitorId = String(formData.get("monitorId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const opensAt = new Date(String(formData.get("opensAt") ?? ""));
  const closesAt = new Date(String(formData.get("closesAt") ?? ""));

  if (
    !monitorId ||
    !title ||
    Number.isNaN(opensAt.getTime()) ||
    Number.isNaN(closesAt.getTime()) ||
    closesAt <= opensAt
  ) {
    return;
  }

  await prisma.inscriptionWindow.create({
    data: { monitorId, title, opensAt, closesAt },
  });
  revalidatePath(PATH);
  revalidatePath("/");
}

export async function toggleWindow(id: string, active: boolean) {
  if (!(await isAdmin())) return;
  await prisma.inscriptionWindow.update({ where: { id }, data: { active } });
  revalidatePath(PATH);
  revalidatePath("/");
}

export async function deleteWindow(id: string) {
  if (!(await isAdmin())) return;
  await prisma.inscriptionWindow.delete({ where: { id } });
  revalidatePath(PATH);
  revalidatePath("/");
}
