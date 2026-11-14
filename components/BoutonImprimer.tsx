"use client";

export default function BoutonImprimer({ className = "btn btn--ghost" }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.print()}>
      Imprimer mes billets
    </button>
  );
}
