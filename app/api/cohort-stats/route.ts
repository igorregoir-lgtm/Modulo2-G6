import { NextResponse } from "next/server";
import { computeCohortStats } from "@/lib/analytics";

// TODO: wire to /api/py cohort-stats once the inference service is live.
export async function GET() {
  try {
    const stats = await computeCohortStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error("[cohort-stats]", err);
    return NextResponse.json({ error: "falha ao agregar cohort" }, { status: 500 });
  }
}
