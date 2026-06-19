import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Raiz do projeto (com barra final), normalizada para forward slashes.
const root = fileURLToPath(new URL(".", import.meta.url)).replace(/\\/g, "/");

export default defineConfig({
  resolve: {
    // Resolve só "@/..." (não toca em "@testing-library/...") para os testes de
    // componente que importam via alias, igual ao tsconfig do Next.
    alias: [{ find: /^@\//, replacement: root }],
  },
  test: {
    // Default node (testes puros); arquivos de componente usam o docblock
    // `// @vitest-environment jsdom`.
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
  },
});
