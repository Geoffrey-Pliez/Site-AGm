import wpData from "../data/wp-content.json";

export type ContentKind = "module" | "sequence" | "fiche" | "autre";

export interface ContentTerms {
  categories?: string[];
  themes?: string[];
  actions?: string[];
  niveau?: string[];
  [key: string]: string[] | undefined;
}

export interface ContentItem {
  id: number;
  type: string;
  title: string;
  slug: string;
  date: string;
  sourceUrl: string;
  routePath: string;
  localUrl: string;
  contentHtml: string;
  featuredImage: { url: string } | null;
  terms: ContentTerms;
}

const content = (wpData.content ?? []) as ContentItem[];

const bySlug = new Map(content.map((item) => [item.slug, item]));

function normalized(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getKind(item?: ContentItem | null): ContentKind {
  const categories = item?.terms?.categories ?? [];
  if (categories.includes("Actions")) return "fiche";
  if (categories.includes("Modules")) return "module";
  if (categories.some((category) => normalized(category).includes("sequence"))) return "sequence";
  return "autre";
}

export function getBySlug(slug: string): ContentItem | undefined {
  return bySlug.get(slug);
}

const FICHE_TO_MODULE: Record<string, string> = {
  "paver-une-figure-1": "paver-des-figures",
  "paver-une-figure-3": "paver-des-figures",
  "puzzle-sam-loyd-3": "puzzle-sam-loyd",
};

function overlapScore(a: ContentItem, b: ContentItem): number {
  let score = 0;
  for (const key of ["themes", "actions", "niveau"] as const) {
    const setA = new Set(a.terms?.[key] ?? []);
    for (const term of b.terms?.[key] ?? []) {
      if (setA.has(term)) score += 1;
    }
  }
  return score;
}

function inferModuleForFiche(fiche: ContentItem): string | null {
  const modules = content.filter((item) => getKind(item) === "module");
  let best: string | null = null;
  let bestScore = 0;
  for (const module of modules) {
    const score = overlapScore(fiche, module);
    if (score > bestScore) {
      bestScore = score;
      best = module.slug;
    }
  }
  return bestScore > 0 ? best : null;
}

export function getModuleForFiche(ficheSlug: string): string | null {
  const fiche = bySlug.get(ficheSlug);
  if (!fiche || getKind(fiche) !== "fiche") return null;
  const explicit = FICHE_TO_MODULE[ficheSlug];
  if (explicit && bySlug.has(explicit)) return explicit;
  if (explicit) return null;
  return inferModuleForFiche(fiche);
}

export function getFichesForModule(moduleSlug: string): string[] {
  if (!bySlug.has(moduleSlug)) return [];
  return content
    .filter((item) => getKind(item) === "fiche")
    .map((item) => item.slug)
    .filter((ficheSlug) => getModuleForFiche(ficheSlug) === moduleSlug);
}

export function validateLinks(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const [ficheSlug, moduleSlug] of Object.entries(FICHE_TO_MODULE)) {
    if (!bySlug.has(ficheSlug)) errors.push(`Unknown fiche slug: ${ficheSlug}`);
    if (!bySlug.has(moduleSlug)) errors.push(`Unknown module slug: ${moduleSlug}`);
  }
  for (const item of content) {
    if (getKind(item) === "fiche") {
      const target = getModuleForFiche(item.slug);
      if (target !== null && !bySlug.has(target)) {
        errors.push(`Dangling module link: ${item.slug} -> ${target}`);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

export const FICHE_MODULE_MAP: Record<string, string> = { ...FICHE_TO_MODULE };
