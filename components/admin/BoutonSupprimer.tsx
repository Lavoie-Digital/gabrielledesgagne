"use client";

/* Suppression avec confirmation : l’action est définitive */
export default function BoutonSupprimer({
  id,
  action,
  quoi,
}: {
  id: string;
  action: (f: FormData) => Promise<void>;
  quoi: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(`Supprimer ${quoi} ? Cette action est définitive.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="adm-btn adm-btn--danger">Supprimer</button>
    </form>
  );
}
