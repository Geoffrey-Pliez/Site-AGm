import { describe, expect, it } from "vitest";
import { APP_BASE_URL, INSTALL_URL, getAppLink } from "../lib/appLink";

describe("getAppLink", () => {
  it("builds the open URL for a valid slug", () => {
    expect(getAppLink("paver-des-figures")).toBe("https://ag.crem.be/open/paver-des-figures");
  });

  it("exposes the base constants", () => {
    expect(APP_BASE_URL).toBe("https://ag.crem.be");
    expect(INSTALL_URL).toBeTruthy();
  });

  it.each([
    "",
    "Paver-Des-Figures",
    "paver_des_figures",
    "paver des figures",
    "-paver",
    "paver-",
    "paver--figures",
    "paveré",
  ])("rejects invalid slug %s", (slug) => {
    expect(() => getAppLink(slug)).toThrow();
  });
});
