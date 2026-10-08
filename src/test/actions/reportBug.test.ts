import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { reportBug } from "../../actions/reportBug";

describe("reportBug action", () => {
  const originalFetch = global.fetch;
  const originalEnv = import.meta.env;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("import.meta", {
      env: {
        GITHUB_TOKEN: "test-token",
        DEV: true,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
    vi.stubGlobal("import.meta", originalEnv);
  });

  it("should create a GitHub issue for a valid bug report", async () => {
    const mockIssue = { number: 42, html_url: "https://github.com/Geoffrey-Pliez/Site-AGm/issues/42" };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockIssue,
    });

    const result = await (reportBug as any).handler({
      message: "Test error message",
      stack: "Error: Test error\n    at test.js:1:1",
      url: "https://example.com/page",
      userAgent: "Mozilla/5.0 Test",
      userId: "user-123",
    });

    expect(result.ok).toBe(true);
    expect(result.issueNumber).toBe(42);
    expect(result.issueUrl).toBe(mockIssue.html_url);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should deduplicate reports within 5 minutes", async () => {
    const mockIssue = { number: 43, html_url: "https://github.com/Geoffrey-Pliez/Site-AGm/issues/43" };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockIssue,
    });

    // First report
    const result1 = await (reportBug as any).handler({
      message: "Duplicate error",
      stack: "Error: Duplicate\n    at test.js:1:1",
      url: "https://example.com/page",
    });

    // Second report (same message, stack, url) - should be deduped
    const result2 = await (reportBug as any).handler({
      message: "Duplicate error",
      stack: "Error: Duplicate\n    at test.js:1:1",
      url: "https://example.com/page",
    });

    expect(result1.ok).toBe(true);
    expect(result1.issueNumber).toBe(43);
    expect(result2.ok).toBe(true);
    expect(result2.issueNumber).toBeUndefined(); // deduped, no issue created
    expect(global.fetch).toHaveBeenCalledTimes(1); // only one API call
  });

  it("should throw ActionError when GitHub API fails", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    await expect(
      (reportBug as any).handler({
        message: "Test error",
      })
    ).rejects.toThrow("Échec de la création de l'issue");
  });

  it("should validate input schema", async () => {
    await expect(
      (reportBug as any).handler({
        message: "", // empty message should fail validation
      })
    ).rejects.toThrow();
  });

  it("should truncate long message and stack", async () => {
    const mockIssue = { number: 44, html_url: "https://github.com/Geoffrey-Pliez/Site-AGm/issues/44" };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockIssue,
    });

    const longMessage = "a".repeat(600);
    const longStack = "b".repeat(9000);

    await (reportBug as any).handler({
      message: longMessage,
      stack: longStack,
    });

    const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
    expect(callBody.title.length).toBeLessThanOrEqual(120 + 6); // "[bug] " + 120 chars
    expect(callBody.body).toContain("a".repeat(500)); // message truncated to 500
    expect(callBody.body).toContain("b".repeat(4000)); // stack truncated to 4000
  });
});