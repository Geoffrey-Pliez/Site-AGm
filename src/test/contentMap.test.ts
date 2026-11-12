import { describe, expect, it } from "vitest";
import wpData from "../data/wp-content.json";
import {
  getBySlug,
  getFichesForModule,
  getKind,
  getModuleForFiche,
  validateLinks,
} from "../lib/contentMap";

describe("contentMap", () => {
  it("keeps the 59 canonical slugs", () => {
    expect(wpData.content).toHaveLength(59);
  });

  it("derives kinds from categories", () => {
    expect(getKind(getBySlug("paver-des-figures"))).toBe("module");
    expect(getKind(getBySlug("suites-de-carres"))).toBe("sequence");
    expect(getKind(getBySlug("paver-une-figure-1"))).toBe("fiche");
  });

  it("maps known fiches to their module", () => {
    expect(getModuleForFiche("paver-une-figure-1")).toBe("paver-des-figures");
    expect(getModuleForFiche("paver-une-figure-3")).toBe("paver-des-figures");
    expect(getModuleForFiche("puzzle-sam-loyd-3")).toBe("puzzle-sam-loyd");
  });

  it("lists fiches for a module", () => {
    const fiches = getFichesForModule("paver-des-figures");
    expect(fiches).toContain("paver-une-figure-1");
    expect(fiches).toContain("paver-une-figure-3");
  });

  it("validates links without dangling references", () => {
    const { valid, errors } = validateLinks();
    expect(errors).toEqual([]);
    expect(valid).toBe(true);
  });

  it("returns null for an unknown fiche", () => {
    expect(getModuleForFiche("fiche-inconnue")).toBeNull();
  });
});
