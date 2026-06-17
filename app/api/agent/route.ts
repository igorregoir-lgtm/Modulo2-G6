import { NextResponse } from "next/server";
import { runTutor, runAdvisor, fallbackAdvisor } from "@/lib/agent";
import { getScoredCustomer } from "@/lib/scoring";
import { writeAudit } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth";

// SERVER ONLY. Never exposes OPENROUTER_API_KEY. Two modes: tutor | advisor.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      mode?: "tutor" | "advisor";
      question?: string;
      context?: string;
      customerId?: string;
    };
    const mode = body?.mode;

    if (mode === "tutor") {
      if (!body.question) {
        return NextResponse.json({ error: "pergunta obrigatória" }, { status: 400 });
      }
      try {
        const answer = await runTutor(body.question, body.context);
        return NextResponse.json({ mode, answer });
      } catch (err) {
        console.error("[agent:tutor]", err);
        return NextResponse.json(
          {
            mode,
            answer:
              "Não consegui falar com o tutor agora (verifique a chave do OpenRouter). " +
              "Mesmo assim: cada tela traz um cartão 'Aprender' explicando o que ela faz e por quê. " +
              "Tente novamente em instantes.",
            degraded: true,
          },
          { status: 200 },
        );
      }
    }

    if (mode === "advisor") {
      if (!body.customerId) {
        return NextResponse.json({ error: "customerId obrigatório" }, { status: 400 });
      }
      const scored = await getScoredCustomer(body.customerId);
      if (!scored) {
        return NextResponse.json({ error: "cliente não encontrado" }, { status: 404 });
      }

      const input = { pred: scored.prediction, externalRef: scored.customer.external_ref };
      let result;
      let degraded = false;
      try {
        result = await runAdvisor(input);
      } catch (err) {
        console.error("[agent:advisor] LLM failed, using fallback:", err);
        result = fallbackAdvisor(input);
        degraded = true;
      }

      const user = await getSessionUser();
      await writeAudit({
        actor: user?.id ?? null,
        actor_email: user?.email ?? null,
        action: "recommend",
        entity: "customer",
        entity_id: String(body.customerId),
        payload: {
          blocked: result.blocked,
          archetype: scored.prediction.archetype,
          risk_tier: scored.prediction.risk_tier,
          recommendation: result.recommendation,
          model_version: scored.prediction.model_version,
          degraded,
          ts: new Date().toISOString(),
        },
      });

      return NextResponse.json({ mode, ...result, degraded });
    }

    return NextResponse.json({ error: "modo inválido (tutor|advisor)" }, { status: 400 });
  } catch (err) {
    console.error("[agent]", err);
    return NextResponse.json({ error: "falha no agente" }, { status: 500 });
  }
}
