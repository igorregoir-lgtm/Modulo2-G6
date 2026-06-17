import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, writeAudit } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth";
import { getScoredCustomer } from "@/lib/scoring";
import type { Archetype } from "@/lib/types";

interface ApplyBody {
  customerId: string;
  archetype?: Archetype;
  offer?: string;
  channel?: string[] | string;
  copy?: string;
  timing?: string;
}

/**
 * Register an intervention. Tries to persist to Supabase `intervention`
 * (RLS: created_by must equal auth.uid()); writes an audit_log row regardless.
 * On a sleeping_dog the intervention is recorded as 'bloqueada' (not applied).
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ApplyBody;
    if (!body?.customerId) {
      return NextResponse.json({ error: "customerId obrigatório" }, { status: 400 });
    }

    const user = await getSessionUser();
    const scored = await getScoredCustomer(body.customerId);
    const archetype = body.archetype ?? scored?.prediction.archetype;
    const blocked =
      scored?.prediction.archetype === "sleeping_dog" ||
      scored?.prediction.proactive_allowed === false;

    const channel = Array.isArray(body.channel)
      ? body.channel.join(", ")
      : (body.channel ?? "");

    // Resolve numeric customer id from Supabase if present (intervention FK).
    let dbCustomerId: number | null = null;
    try {
      const admin = createAdminClient();
      const { data } = await admin
        .from("customer")
        .select("id")
        .or(`external_ref.eq.${body.customerId},id.eq.${Number(body.customerId) || -1}`)
        .maybeSingle();
      if (data?.id) dbCustomerId = data.id as number;
    } catch {
      /* customer table empty / not seeded — sample-only mode */
    }

    let persisted = false;
    if (dbCustomerId && user) {
      try {
        const supabase = await createClient();
        const { error } = await supabase.from("intervention").insert({
          customer_id: dbCustomerId,
          archetype: archetype ?? null,
          offer: body.offer ?? null,
          channel,
          copy: body.copy ?? null,
          timing: body.timing ?? null,
          status: blocked ? "bloqueada" : "aplicada",
          created_by: user.id,
        });
        persisted = !error;
        if (error) console.error("[apply-intervention] insert error:", error.message);
      } catch (err) {
        console.error("[apply-intervention] insert threw:", err);
      }
    }

    await writeAudit({
      actor: user?.id ?? null,
      actor_email: user?.email ?? null,
      action: "apply_intervention",
      entity: "customer",
      entity_id: String(body.customerId),
      payload: {
        archetype,
        offer: body.offer,
        channel,
        timing: body.timing,
        status: blocked ? "bloqueada" : "aplicada",
        persisted,
        model_version: scored?.prediction.model_version,
        ts: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      ok: true,
      status: blocked ? "bloqueada" : "aplicada",
      persisted,
      blocked,
    });
  } catch (err) {
    console.error("[apply-intervention]", err);
    return NextResponse.json({ error: "falha ao aplicar intervenção" }, { status: 500 });
  }
}
