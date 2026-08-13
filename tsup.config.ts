import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: true,
  target: "es2020",
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" }
  },
})
