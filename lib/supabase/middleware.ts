import { NextResponse, type NextRequest } from "next/server";

/**
 * Acesso ABERTO (sem necessidade de usuário/senha neste momento).
 * O middleware apenas segue a requisição — não há mais redirecionamento para
 * /login. (Histórico: antes refrescava a sessão Supabase e protegia as rotas.)
 */
export async function updateSession(request: NextRequest) {
  return NextResponse.next({ request });
}
