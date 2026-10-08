import { vi } from "vitest";

// Mock astro:actions and astro:schema before any imports
vi.mock("astro:actions", async () => {
  const mod = await import("./__mocks__/astro.ts");
  return {
    defineAction: mod.defineAction,
    ActionError: mod.ActionError,
  };
});

vi.mock("astro:schema", async () => {
  const mod = await import("./__mocks__/astro.ts");
  return {
    z: mod.z,
    defineAction: mod.defineAction,
    ActionError: mod.ActionError,
  };
});

// Setup global pour les tests
vi.stubGlobal("import.meta", {
  env: {
    GITHUB_TOKEN: "test-token",
    DEV: true,
  },
});