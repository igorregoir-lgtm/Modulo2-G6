// Casca de seção do dossiê — âncora (#id) + cabeçalho consistente. Sem estado.
// See docs/superpowers/specs/2026-06-19-dossie-explicabilidade-design.md §4.

export function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-[var(--rule)] pt-8">
      <p className="eyebrow mb-1 text-[var(--accent-deep)]">{eyebrow}</p>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-[28px]">
        {title}
      </h2>
      <div className="mt-4 flex flex-col gap-4 text-[15px] leading-relaxed text-[var(--ink-soft)]">
        {children}
      </div>
    </section>
  );
}
