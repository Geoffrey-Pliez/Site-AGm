import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";

// --- Types ---

interface BugReportInput {
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
}

interface BugReportResult {
  ok: boolean;
  issueNumber?: number;
  issueUrl?: string;
}

// --- GitHub API ---

const GITHUB_REPO = "Geoffrey-Pliez/Site-AGm";
const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
const DEDUP_TTL_MS = 5 * 60 * 1000; // 5 minutes

// In-memory dedup (dev) — replace with Firestore in production
const recentReports = new Map<string, number>();

function dedupKey(input: BugReportInput): string {
  const stackFirstLine = (input.stack || "").split("\n")[0] || "";
  return `${input.message}|${stackFirstLine}|${input.url || ""}`;
}

async function createGitHubIssue(
  title: string,
  body: string,
  labels: string[]
): Promise<{ number: number; url: string }> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body, labels }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("[reportBug] GitHub API error", { status: res.status, text });
    throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
      message: "Impossible de créer l'issue GitHub",
    });
  }

  const data = await res.json();
  return { number: data.number, url: data.html_url };
}

// --- Action ---

export const reportBug = defineAction({
  input: z.object({
    message: z.string().min(1, "Le message est requis").max(500),
    stack: z.string().max(8000).optional(),
    url: z.string().max(2000).optional(),
    userAgent: z.string().max(500).optional(),
    userId: z.string().max(200).optional(),
  }),
  handler: async (input: BugReportInput): Promise<BugReportResult> => {
    // --- Dedup ---
    const key = dedupKey(input);
    const now = Date.now();
    const existing = recentReports.get(key);
    if (existing && now - existing < DEDUP_TTL_MS) {
      console.info("[reportBug] Bug report deduped", { key });
      return { ok: true }; // Silently ignore duplicate
    }
    recentReports.set(key, now);

    // --- Build issue ---
    const title = `[bug] ${(input.message || "Erreursignalé").slice(0, 120)}`;
    const body = [
      "## 🐛 Signalement d'erreur automatique",
      "",
      "**Message :**",
      input.message,
      "",
      "**URL :**",
      input.url || "(inconnue)",
      "",
      "**Utilisateur :**",
      input.userId || "(anonyme)",
      "",
      "**User-Agent :**",
      input.userAgent || "(inconnu)",
      "",
      "**Stack trace :**",
      input.stack ? "```\n" + input.stack.slice(0, 4000) + "\n```" : "(aucune)",
      "",
      "---",
      `_Généré automatiquement le ${new Date().toISOString()}_`,
    ].join("\n");

    try {
      const { number, url } = await createGitHubIssue(title, body, ["bug", "auto-report"]);
      console.info("[reportBug] Bug issue created", { number, url });
      return { ok: true, issueNumber: number, issueUrl: url };
    } catch (err) {
      console.error("[reportBug] Failed to create bug issue", err);
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Échec de la création de l'issue",
      });
    }
  },
});