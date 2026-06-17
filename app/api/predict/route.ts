import { NextResponse } from "next/server";
import { predictHeuristic } from "@/lib/heuristic";
import { writeAudit } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth";
import type { CustomerFeatures } from "@/lib/types";

// TODO: wire to /api/py inference (joblib model + SHAP). For now: transparent
// heuristic so the contract shape is exercised end-to-end.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { features?: CustomerFeatures; customerId?: string };
    if (!body?.features) {
      return NextResponse.json({ error: "features obrigatórias" }, { status: 400 });
    }
    const id = body.customerId ?? "ad-hoc";
    const result = predictHeuristic(id, body.features);

    const user = await getSessionUser();
    await writeAudit({
      actor: user?.id ?? null,
      actor_email: user?.email ?? null,
      action: "predict",
      entity: "customer",
      entity_id: String(id),
      payload: {
        features: body.features,
        churn_probability: result.churn_probability,
        risk_tier: result.risk_tier,
        archetype: result.archetype,
        threshold: result.threshold,
        model_version: result.model_version,
        ts: new Date().toISOString(),
      },
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[predict]", err);
    return NextResponse.json({ error: "falha na previsão" }, { status: 500 });
  }
}
