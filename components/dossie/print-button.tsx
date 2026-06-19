"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-white/25 px-3 py-1.5 text-sm text-[var(--paper)] transition-colors hover:bg-white/10"
    >
      <Printer className="h-4 w-4" />
      <span className="hidden sm:inline">Imprimir / PDF</span>
    </button>
  );
}
