"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const COOKIE = "admin_token";
const PATH = "/admin/ventanas";

/** Gate temporal hasta tener el auth real de la Fase 3. */
export async function isAuthed(): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  return token === secret;
}

export async function unlock(formData: FormData) {
  const secret = String(formData.get("secret") ?? "");
  if (secret && secret === process.env.ADMIN_SECRET) {
    (await cookies()).set(COOKIE, secret, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8h
    });
  }
  revalidatePath(PATH);
}

export async function logout() {
  (await cookies()).delete(COOKIE);
  revalidatePath(PATH);
}

export async function createWindow(formData: FormData) {
  if (!(await isAuthed())) return;

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
  if (!(await isAuthed())) return;
  await prisma.inscriptionWindow.update({ where: { id }, data: { active } });
  revalidatePath(PATH);
  revalidatePath("/");
}

export async function deleteWindow(id: string) {
  if (!(await isAuthed())) return;
  await prisma.inscriptionWindow.delete({ where: { id } });
  revalidatePath(PATH);
  revalidatePath("/");
}
