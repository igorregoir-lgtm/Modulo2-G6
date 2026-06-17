import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Protected non-Next dirs owned by other processes (Python / data / docs).
    ".venv/**",
    "pipeline/**",
    "notebooks/**",
    "data/**",
    "docs/**",
    "supabase/**",
    "backend/**",
    "frontend/**",
    "legacy/**",
  ]),
]);

export default eslintConfig;
