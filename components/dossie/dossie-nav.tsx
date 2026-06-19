"use client";

// Índice fixo do dossiê (âncoras #id). Realce da seção ativa via
// IntersectionObserver — setState vive no CALLBACK do observer (não síncrono no
// corpo do efeito), respeitando o lint react-hooks/set-state-in-effect.
// See docs/superpowers/specs/2026-06-19-dossie-explicabilidade-design.md §4, §7.

import * as React from "react";
import { cn } from "@/lib/utils";
import { SECTIONS } from "@/lib/dossie/sections";

export function DossieNav() {
  const [active, setActive] = React.useState<string>(SECTIONS[0].id);

  React.useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (els.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <nav aria-label="Índice do dossiê" className="no-print flex flex-col gap-0.5 text-sm">
      <p className="eyebrow mb-2">Índice</p>
      {SECTIONS.map((s, i) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          aria-current={active === s.id ? "true" : undefined}
          className={cn(
            "flex items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-1.5 transition-colors",
            active === s.id
              ? "bg-[var(--accent-light)] font-semibold text-[var(--primary-deep)]"
              : "text-[var(--steel)] hover:bg-[var(--paper-soft)] hover:text-[var(--ink)]",
          )}
        >
          <span className="mono text-[10px] text-[var(--steel-soft)]">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span>{s.label}</span>
        </a>
      ))}
    </nav>
  );
}
