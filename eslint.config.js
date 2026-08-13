import eslint from "@eslint/js"
import parser from "@typescript-eslint/parser"
import plugin from "@typescript-eslint/eslint-plugin"

export default [
  { ignores: ["dist", "coverage", "node_modules"] },
  eslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser,
      globals: {
        console: "readonly",
        document: "readonly",
        navigator: "readonly",
        performance: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        structuredClone: "readonly",
        window: "readonly",
      },
    },
    plugins: { "@typescript-eslint": plugin },
    rules: {
      ...plugin.configs.recommended.rules,
      "no-debugger": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    },
  },
]
