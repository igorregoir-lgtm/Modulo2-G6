import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — SERVER ONLY. Bypasses RLS. Use for audit_log
 * writes and reads that must ignore row-level security. NEVER import this from
 * a client component.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase admin client missing URL or SERVICE_ROLE_KEY env.");
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

interface AuditEntry {
  actor?: string | null;
  actor_email?: string | null;
  action: string;
  entity?: string | null;
  entity_id?: string | null;
  payload?: unknown;
}

/**
 * Append an audit_log row via the service role. Never throws into the request
 * path — auditing failures are logged but must not break the user action.
 */
export async function writeAudit(entry: AuditEntry): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("audit_log").insert({
      actor: entry.actor ?? null,
      actor_email: entry.actor_email ?? null,
      action: entry.action,
      entity: entry.entity ?? null,
      entity_id: entry.entity_id ?? null,
      payload: entry.payload ?? null,
    });
  } catch (err) {
    console.error("[audit] failed to write audit_log:", err);
  }
}
