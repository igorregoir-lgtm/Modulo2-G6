import { NextResponse } from "next/server";
import { computeEdaSummary } from "@/lib/analytics";

// TODO: wire to /api/py eda-summary (precomputed EDA artifacts in Storage).
export async function GET() {
  try {
    const summary = await computeEdaSummary();
    return NextResponse.json(summary);
  } catch (err) {
    console.error("[eda-summary]", err);
    return NextResponse.json({ error: "falha ao computar EDA" }, { status: 500 });
  }
}
