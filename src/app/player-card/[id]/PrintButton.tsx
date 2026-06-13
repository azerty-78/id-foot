"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print mb-6 rounded-lg bg-[#1a472a] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#153d24]"
    >
      Imprimer
    </button>
  );
}
