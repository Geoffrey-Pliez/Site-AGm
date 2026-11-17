import { describe, expect, it } from "vitest";
import { modules } from "../data/site";
import {
  FICHE_MODULE_MAP,
  getModuleForFiche,
} from "../lib/contentMap";

describe("site links cross-check (contentMap single source of truth)", () => {
  it("resolves legacy site fiches via getModuleForFiche", () => {
    expect(getModuleForFiche("paver-une-figure-1")).toBe("paver-des-figures");
    expect(getModuleForFiche("paver-une-figure-3")).toBe("paver-des-figures");
  });

  it("keeps site.ts free of mapping fields", () => {
    for (const item of modules) {
      expect(item).not.toHaveProperty("moduleSlug");
      expect(item).not.toHaveProperty("ficheIds");
    }
  });

  it("keeps FICHE_MODULE_MAP consistent with getModuleForFiche", () => {
    for (const [fiche, module] of Object.entries(FICHE_MODULE_MAP)) {
      expect(getModuleForFiche(fiche)).toBe(module);
    }
  });
});
