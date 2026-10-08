import { getViteConfig } from "astro/config";
import type { ViteUserConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: ViteUserConfig = {
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "dist/",
        ".astro/",
      ],
    },
    deps: {
          optimizer: {
            client: {
              include: ["astro:actions", "astro:schema"],
            },
          },
        },
    mockReset: true,
  },
  resolve: {
    alias: {
      "astro:actions": path.resolve(__dirname, "./src/test/__mocks__/astro.ts"),
      "astro:schema": path.resolve(__dirname, "./src/test/__mocks__/astro.ts"),
    },
  },
  define: {
    "import.meta.vitest": "undefined",
  },
};

export default getViteConfig(config);