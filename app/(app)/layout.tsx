import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

// Acesso aberto: não exige login. Se houver sessão, usa o perfil; caso
// contrário, entra como convidado com visão completa (role 'admin').
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <AppShell role={user?.role ?? "admin"} email={user?.email ?? null}>
      {children}
    </AppShell>
  );
}
