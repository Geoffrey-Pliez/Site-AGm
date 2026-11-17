import { describe, expect, it } from "vitest";
import { getLinkedFiches, getParentModule, modules } from "../../data/site";
import { getFichesForModule } from "../../lib/contentMap";

const EXPECTED_SLUGS = [
  "prise-en-main-agm-5-ans",
  "prise-en-main-planche-geoplan",
  "paver-des-figures",
  "paver-une-figure-1",
  "paver-une-figure-3",
  "agrandissements",
  "suites-de-carres",
  "tangrams-julie-tom",
];

describe("site Fiche -> Module link", () => {
  it("keeps existing slugs unchanged", () => {
    expect(modules.map((item) => item.slug)).toEqual(EXPECTED_SLUGS);
  });

  it("resolves both paver fiches to their parent module", () => {
    expect(getParentModule("paver-une-figure-1")?.slug).toBe("paver-des-figures");
    expect(getParentModule("paver-une-figure-3")?.slug).toBe("paver-des-figures");
  });

  it("lists linked fiches from the parent module", () => {
    const fiches = getLinkedFiches("paver-des-figures").map((item) => item.slug).sort();
    expect(fiches).toEqual(["paver-une-figure-1", "paver-une-figure-3"]);
  });

  it("derives linked fiches from the single contentMap source", () => {
    const linked = getLinkedFiches("paver-des-figures").map((item) => item.slug).sort();
    expect(getFichesForModule("paver-des-figures").sort()).toEqual(linked);
    expect(modules.some((item) => "moduleSlug" in item || "ficheIds" in item)).toBe(false);
  });
});
