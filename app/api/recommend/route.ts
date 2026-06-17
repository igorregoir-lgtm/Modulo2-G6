import { NextResponse } from "next/server";
import { runAdvisor, fallbackAdvisor } from "@/lib/agent";
import { getScoredCustomer } from "@/lib/scoring";
import { writeAudit } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth";

// Convenience wrapper that always returns an AdvisorResult (advisor mode).
export async function POST(req: Request) {
  try {
    const { customerId } = (await req.json()) as { customerId?: string };
    if (!customerId) {
      return NextResponse.json({ error: "customerId obrigatório" }, { status: 400 });
    }
    const scored = await getScoredCustomer(customerId);
    if (!scored) {
      return NextResponse.json({ error: "cliente não encontrado" }, { status: 404 });
    }

    const input = { pred: scored.prediction, externalRef: scored.customer.external_ref };
    let result;
    let degraded = false;
    try {
      result = await runAdvisor(input);
    } catch (err) {
      console.error("[recommend] LLM failed, using fallback:", err);
      result = fallbackAdvisor(input);
      degraded = true;
    }

    const user = await getSessionUser();
    await writeAudit({
      actor: user?.id ?? null,
      actor_email: user?.email ?? null,
      action: "recommend",
      entity: "customer",
      entity_id: String(customerId),
      payload: {
        blocked: result.blocked,
        archetype: scored.prediction.archetype,
        recommendation: result.recommendation,
        model_version: scored.prediction.model_version,
        degraded,
        ts: new Date().toISOString(),
      },
    });

    return NextResponse.json({ ...result, degraded });
  } catch (err) {
    console.error("[recommend]", err);
    return NextResponse.json({ error: "falha na recomendação" }, { status: 500 });
  }
}
