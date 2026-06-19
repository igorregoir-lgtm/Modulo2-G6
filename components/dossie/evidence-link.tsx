// Chip "ver evidência" — deep link p/ tela viva (rota interna) ou doc (GitHub).
// "mostrar > contar": cada claim aponta para o artefato vivo / a evidência.

import Link from "next/link";
import { ArrowUpRight, ExternalLink, FileText } from "lucide-react";
import type { Evidence } from "@/lib/dossie/facts";

function Chip({ ev }: { ev: Evidence }) {
  const isTela = ev.kind === "tela";
  const Icon = isTela ? ArrowUpRight : ev.href.startsWith("http") ? ExternalLink : FileText;
  const cls =
    "inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/40 bg-[var(--accent-light)]/40 px-3 py-1 text-xs font-medium text-[var(--accent-deep)] transition-colors hover:bg-[var(--accent-light)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]";
  const inner = (
    <>
      <span className="text-[10px] uppercase tracking-wide text-[var(--steel)]">
        {isTela ? "tela" : "doc"}
      </span>
      {ev.label}
      <Icon className="h-3.5 w-3.5" />
    </>
  );
  return isTela ? (
    <Link href={ev.href} className={cls}>
      {inner}
    </Link>
  ) : (
    <a href={ev.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  );
}

/** Linha de chips de evidência. */
export function EvidenceRow({ items }: { items: Evidence[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {items.map((ev) => (
        <Chip key={ev.href} ev={ev} />
      ))}
    </div>
  );
}
