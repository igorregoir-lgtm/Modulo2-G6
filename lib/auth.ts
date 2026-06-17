import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export interface SessionUser {
  id: string;
  email: string | null;
  role: UserRole;
}

/**
 * Resolve the current authenticated user and their profile role. Returns null
 * when unauthenticated. Defaults role to 'cs' if the profile row is missing.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let role: UserRole = "cs";
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role) role = profile.role as UserRole;

  return { id: user.id, email: user.email ?? null, role };
}
