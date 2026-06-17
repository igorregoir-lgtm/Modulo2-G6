"use client";

import * as React from "react";
import { GraduationCap, ChevronDown, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AprenderCardProps {
  /** Short concept id / screen name passed to the tutor as context. */
  screen: string;
  title: string;
  /** Static "what & why" content (always available, no LLM needed). */
  what: string;
  why: string;
  /** Optional extra bullets (e.g. theory references). */
  bullets?: string[];
  defaultOpen?: boolean;
}

export function AprenderCard({
  screen,
  title,
  what,
  why,
  bullets,
  defaultOpen = false,
}: AprenderCardProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [tutorAnswer, setTutorAnswer] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function askTutor() {
    setLoading(true);
    setTutorAnswer(null);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "tutor",
          question: `Explique de forma simples e acolhedora a tela "${title}": o que ela faz e por que ela importa para reduzir cancelamentos.`,
          context: `Tela: ${screen}. O que faz: ${what} Por que existe: ${why}`,
        }),
      });
      const data = await res.json();
      setTutorAnswer(data.answer ?? "Não foi possível obter a explicação agora.");
    } catch {
      setTutorAnswer("Não foi possível falar com o tutor agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--rule)] bg-[var(--paper-soft)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-light)] text-[var(--accent-deep)]">
          <GraduationCap className="h-4 w-4" />
        </span>
        <span className="flex flex-col">
          <span className="eyebrow">Aprender · PBL</span>
          <span className="text-sm font-semibold text-[var(--ink)]">{title}</span>
        </span>
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 text-[var(--steel)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="border-t border-[var(--rule)] px-4 py-4 text-sm leading-relaxed text-[var(--ink-soft)]">
          <p className="mb-2">
            <span className="font-semibold text-[var(--ink)]">O que faz: </span>
            {what}
          </p>
          <p className="mb-2">
            <span className="font-semibold text-[var(--ink)]">Por que existe: </span>
            {why}
          </p>
          {bullets && bullets.length > 0 && (
            <ul className="mb-3 ml-4 list-disc space-y-1 text-[var(--steel)]">
              {bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}

          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={askTutor} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Perguntar ao tutor
            </Button>
          </div>

          {tutorAnswer && (
            <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--accent-light)] bg-[var(--accent-light)]/40 p-3 text-[var(--ink-soft)]">
              <p className="eyebrow mb-1 text-[var(--accent-deep)]">Tutor</p>
              <p className="whitespace-pre-wrap">{tutorAnswer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
