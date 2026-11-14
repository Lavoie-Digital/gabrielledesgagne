"use server";

import { revalidatePath } from "next/cache";
import { changerOuverture } from "@/lib/billetterie";
import { envoyerBillets } from "@/lib/envoi-billets";
import { envoyerRemerciementDon } from "@/lib/envoi-dons";
import { exigerAdmin } from "@/lib/session";

export type RetourEnvoi = { ok: boolean; message: string } | null;

/* « Renvoyer les billets » depuis l’espace privé */
export async function renvoyerBillets(_: RetourEnvoi, form: FormData): Promise<RetourEnvoi> {
  await exigerAdmin();
  const id = String(form.get("id") ?? "");
  try {
    const r =
      form.get("type") === "don" ? await envoyerRemerciementDon(id, true) : await envoyerBillets(id, true);
    revalidatePath("/admin/billets");
    if (r === "non-configure") return { ok: false, message: "SendGrid n’est pas configuré." };
    if (r === "rien-a-faire") return { ok: false, message: "Introuvable ou non payé." };
    return { ok: true, message: "Envoyé" };
  } catch (e) {
    revalidatePath("/admin/billets");
    return { ok: false, message: e instanceof Error ? e.message.slice(0, 120) : "Échec de l’envoi" };
  }
}

/* Ouvrir ou fermer la billetterie */
export async function basculerBilletterie(form: FormData) {
  const admin = await exigerAdmin();
  await changerOuverture(form.get("ouverte") === "oui", admin.courriel);
  revalidatePath("/admin/billets");
  revalidatePath("/billets");
}
