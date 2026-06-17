"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Ban, Send, Loader2, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { TierBadge } from "@/components/tier-badge";
import { cn, pct } from "@/lib/utils";
import { ARCHETYPE_LABELS } from "@/lib/labels";
import type { Archetype, RiskTier } from "@/lib/types";

export interface PortfolioRow {
  id: string;
  external_ref: string;
  churn_probability: number;
  risk_tier: RiskTier;
  archetype: Archetype;
  proactive_allowed: boolean;
}

const ARCHETYPES: Archetype[] = [
  "preco_sensivel",
  "desengajado_conteudo",
  "early_dropper",
  "sleeping_dog",
  "concorrente_driven",
];
const TIERS: RiskTier[] = ["critico", "alto", "medio", "baixo"];

export function CarteiraView({ rows }: { rows: PortfolioRow[] }) {
  const [tier, setTier] = React.useState<string>("todos");
  const [arch, setArch] = React.useState<string>("todos");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [batching, setBatching] = React.useState(false);

  const filtered = rows
    .filter((r) => (tier === "todos" ? true : r.risk_tier === tier))
    .filter((r) => (arch === "todos" ? true : r.archetype === arch))
    .sort((a, b) => b.churn_probability - a.churn_probability);

  const eligible = filtered.filter((r) => r.proactive_allowed);
  const blockedCount = filtered.filter((r) => !r.proactive_allowed).length;

  function toggle(id: string, allowed: boolean) {
    if (!allowed) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === eligible.length) setSelected(new Set());
    else setSelected(new Set(eligible.map((r) => r.id)));
  }

  async function applyBatch() {
    if (selected.size === 0) return;
    setBatching(true);
    let ok = 0;
    try {
      await Promise.all(
        Array.from(selected).map(async (id) => {
          const r = rows.find((x) => x.id === id);
          const res = await fetch("/api/apply-intervention", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerId: id,
              archetype: r?.archetype,
              offer: "Ação de retenção em lote",
              channel: ["e-mail"],
              timing: "Esta semana",
            }),
          });
          if (res.ok) ok += 1;
        }),
      );
      toast.success(`${ok} intervenção(ões) registrada(s) e auditada(s).`);
      setSelected(new Set());
    } catch {
      toast.error("Falha ao aplicar ações em lote.");
    } finally {
      setBatching(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 pt-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t">Tier de risco</Label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger id="t" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tiers</SelectItem>
                {TIERS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="a">Arquétipo</Label>
            <Select value={arch} onValueChange={setArch}>
              <SelectTrigger id="a" className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os arquétipos</SelectItem>
                {ARCHETYPES.map((a) => (
                  <SelectItem key={a} value={a}>
                    {ARCHETYPE_LABELS[a]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {blockedCount > 0 && (
              <Badge variant="medio" className="gap-1">
                <Ban className="h-3 w-3" />
                {blockedCount} excluído(s)
              </Badge>
            )}
            <Button
              variant="accent"
              size="sm"
              onClick={applyBatch}
              disabled={selected.size === 0 || batching}
            >
              {batching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Ação em lote ({selected.size})
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  aria-label="Selecionar todos elegíveis"
                  checked={eligible.length > 0 && selected.size === eligible.length}
                  onChange={toggleAll}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
              </TableHead>
              <TableHead>Membro</TableHead>
              <TableHead>Risco</TableHead>
              <TableHead>Probabilidade</TableHead>
              <TableHead>Arquétipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => {
              const blocked = !r.proactive_allowed;
              return (
                <TableRow key={r.id} className={cn(blocked && "opacity-60")}>
                  <TableCell>
                    <input
                      type="checkbox"
                      aria-label={`Selecionar ${r.external_ref}`}
                      disabled={blocked}
                      checked={selected.has(r.id)}
                      onChange={() => toggle(r.id, r.proactive_allowed)}
                      className="h-4 w-4 accent-[var(--accent)] disabled:cursor-not-allowed"
                    />
                  </TableCell>
                  <TableCell className="mono font-medium text-[var(--ink)]">
                    {r.external_ref}
                  </TableCell>
                  <TableCell>
                    <TierBadge tier={r.risk_tier} />
                  </TableCell>
                  <TableCell className="mono">{pct(r.churn_probability)}</TableCell>
                  <TableCell className="text-sm text-[var(--ink-soft)]">
                    {ARCHETYPE_LABELS[r.archetype]}
                  </TableCell>
                  <TableCell>
                    {blocked ? (
                      <Badge variant="medio" className="gap-1">
                        <Ban className="h-3 w-3" />
                        Excluído — não-intrusão
                      </Badge>
                    ) : (
                      <Badge variant="muted">Elegível</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {blocked ? (
                      <Link
                        href="/principios-de-personalizacao"
                        className="inline-flex items-center gap-1 text-xs text-[var(--accent-deep)] hover:underline"
                      >
                        Política <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : (
                      <Link
                        href="/individual"
                        className="inline-flex items-center gap-1 text-xs text-[var(--accent-deep)] hover:underline"
                      >
                        Detalhar <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-[var(--steel)]">
                  Nenhum membro para os filtros selecionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <p className="text-xs text-[var(--steel)]">
        Membros do perfil &quot;cão que dorme&quot; aparecem em cinza e não podem ser selecionados
        para ação — política de não-intrusão aplicada na interface e no servidor.
      </p>
    </div>
  );
}
