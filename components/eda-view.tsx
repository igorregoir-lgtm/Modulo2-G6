"use client";

import * as React from "react";
import {
  ChurnByContract,
  SurvivalCurve,
  FreqByChurn,
  CorrelationHeatmap,
  FreqScatter,
  ChurnByCohort,
} from "@/components/charts/eda-charts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { EdaSummary } from "@/lib/types";

export function EdaView({ summary }: { summary: EdaSummary }) {
  const [contract, setContract] = React.useState<string>("todos");
  const [cohort, setCohort] = React.useState<string>("todos");

  const byContract =
    contract === "todos"
      ? summary.by_contract
      : summary.by_contract.filter((c) => String(c.contract) === contract);

  const byCohort =
    cohort === "todos" ? summary.by_cohort : summary.by_cohort.filter((c) => c.cohort === cohort);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-4 rounded-[var(--radius-lg)] border border-[var(--rule)] bg-[var(--paper)] p-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-contract">Filtrar por contrato</Label>
          <Select value={contract} onValueChange={setContract}>
            <SelectTrigger id="f-contract" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os contratos</SelectItem>
              <SelectItem value="1">Mensal</SelectItem>
              <SelectItem value="6">Semestral</SelectItem>
              <SelectItem value="12">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-cohort">Filtrar por cohort</Label>
          <Select value={cohort} onValueChange={setCohort}>
            <SelectTrigger id="f-cohort" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as cohorts</SelectItem>
              {summary.by_cohort.map((c) => (
                <SelectItem key={c.cohort} value={c.cohort}>
                  {c.cohort}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="muted">{summary.n.toLocaleString("pt-BR")} registros</Badge>
          <Badge variant="critico">Churn base: {(summary.churn_rate * 100).toFixed(1)}%</Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChurnByContract data={byContract} />
        <SurvivalCurve data={summary.survival} />
        <FreqByChurn data={summary.freq_dist} />
        <ChurnByCohort data={byCohort} />
        <FreqScatter data={summary.scatter} />
        <CorrelationHeatmap data={summary.correlation} />
      </div>
    </div>
  );
}
