"use client";

import { useActionState } from "react";
import { renvoyerBillets } from "@/app/admin/(prive)/billets/actions";

export default function BoutonRenvoyer({
  id,
  dejaEnvoye,
  type = "billets",
}: {
  id: string;
  dejaEnvoye: boolean;
  type?: "billets" | "don";
}) {
  const [etat, action, envoi] = useActionState(renvoyerBillets, null);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="type" value={type} />
      <button type="submit" className="adm-btn" disabled={envoi} style={{ fontSize: ".78rem", padding: ".35em .8em" }}>
        {envoi ? "Envoi…" : dejaEnvoye ? "Renvoyer" : "Envoyer"}
      </button>
      {etat && <small style={{ color: etat.ok ? "#2F5A3B" : "#7A3226" }}>{etat.message}</small>}
    </form>
  );
}
