import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const apiBase = "https://agmobile.crem.be/wp-json/wp/v2";
const siteBase = "https://agmobile.crem.be";
const uploadsBase = `${siteBase}/wp-content/uploads/`;
const outputFile = new URL("../src/data/wp-content.json", import.meta.url);
const publicRoot = fileURLToPath(new URL("../public/", import.meta.url));
const uploadsRoot = join(publicRoot, "wp-content", "uploads");

const taxonomies = [
  "categories",
  "tags",
  "niveau",
  "actions",
  "themes",
  "grandeurs",
  "solides_et_figures",
  "competences_transversales",
];

const localRouteConflicts = new Set(["", "modules", "prise-en-main", "sequences"]);

function decodeEntities(value = "") {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8220;|&ldquo;/g, "“")
    .replace(/&#8221;|&rdquo;/g, "”")
    .replace(/&#038;|&amp;/g, "&")
    .replace(/&#8230;|&hellip;/g, "…")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&#039;/g, "'");
}

function textFromHtml(html = "") {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function pathnameFromLink(link) {
  const url = new URL(link);
  return url.pathname.replace(/^\/+|\/+$/g, "");
}

function routePathFor(item) {
  const path = pathnameFromLink(item.link);
  if (localRouteConflicts.has(path)) {
    return `wordpress/${path || "accueil"}`;
  }
  return path;
}

function localUploadPath(sourceUrl = "") {
  return sourceUrl.startsWith(uploadsBase) ? sourceUrl.replace(siteBase, "") : sourceUrl;
}

function rewriteInternalLinks(html = "") {
  return html
    .replaceAll("http://agmobile.crem.be/", "/")
    .replaceAll("https://agmobile.crem.be/", "/")
    .replaceAll("http://agmobile.crem.be/wp-content/uploads/", "/wp-content/uploads/")
    .replaceAll("https://agmobile.crem.be/wp-content/uploads/", "/wp-content/uploads/")
    .replaceAll("http://agmobile.crem.be/wp-content/", "/wp-content/")
    .replaceAll("https://agmobile.crem.be/wp-content/", "/wp-content/");
}

async function fetchAll(endpoint, params = {}) {
  const all = [];
  let page = 1;
  while (true) {
    const url = new URL(`${apiBase}/${endpoint}`);
    url.searchParams.set("per_page", "100");
    url.searchParams.set("page", String(page));
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 400 && page > 1) break;
      throw new Error(`${response.status} while fetching ${url}`);
    }

    const items = await response.json();
    all.push(...items);
    const totalPages = Number(response.headers.get("x-wp-totalpages") || "1");
    if (page >= totalPages) break;
    page += 1;
  }
  return all;
}

async function termMapFor(endpoint) {
  try {
    const terms = await fetchAll(endpoint, { hide_empty: "false" });
    return Object.fromEntries(terms.map((term) => [term.id, decodeEntities(term.name)]));
  } catch {
    return {};
  }
}

async function ensureFile(url, destination) {
  try {
    await access(destination);
    return false;
  } catch {}

  await mkdir(dirname(destination), { recursive: true });
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      console.warn(`Missing media skipped: ${url}`);
      return null;
    }
    throw new Error(`${response.status} while downloading ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, buffer);
  return true;
}

function mapTerms(item, termMaps) {
  const mapped = {};
  for (const taxonomy of taxonomies) {
    const ids = item[taxonomy] || [];
    mapped[taxonomy] = ids.map((id) => termMaps[taxonomy]?.[id]).filter(Boolean);
  }
  return mapped;
}

function normalizeContent(item, type, termMaps, mediaById) {
  const title = decodeEntities(
    item.title?.rendered || (type === "page" && pathnameFromLink(item.link) === "" ? "Accueil" : "Sans titre"),
  );
  const excerpt = textFromHtml(item.excerpt?.rendered || item.content?.rendered || "").slice(0, 260);
  const featured = mediaById.get(item.featured_media);
  const routePath = routePathFor(item);

  return {
    id: item.id,
    type,
    title,
    slug: item.slug,
    date: item.date,
    modified: item.modified,
    sourceUrl: item.link,
    sourcePath: pathnameFromLink(item.link),
    routePath,
    localUrl: `/${routePath}/`,
    parent: item.parent || 0,
    excerpt,
    contentHtml: rewriteInternalLinks(item.content?.rendered || ""),
    featuredImage: featured
      ? {
          url: localUploadPath(featured.source_url),
          alt: decodeEntities(featured.alt_text || ""),
          caption: textFromHtml(featured.caption?.rendered || ""),
        }
      : null,
    terms: mapTerms(item, termMaps),
  };
}

const [posts, pages, media, ...termMapEntries] = await Promise.all([
  fetchAll("posts", { status: "publish" }),
  fetchAll("pages", { status: "publish" }),
  fetchAll("media"),
  ...taxonomies.map((taxonomy) => termMapFor(taxonomy)),
]);

const termMaps = Object.fromEntries(taxonomies.map((taxonomy, index) => [taxonomy, termMapEntries[index]]));
const mediaById = new Map(media.map((item) => [item.id, item]));

let downloaded = 0;
let skipped = 0;
let missing = 0;
for (const item of media) {
  const sourceUrl = item.source_url;
  if (!sourceUrl || !sourceUrl.startsWith(uploadsBase)) continue;
  const relative = sourceUrl.slice(uploadsBase.length);
  const destination = join(uploadsRoot, relative);
  const written = await ensureFile(sourceUrl, destination);
  if (written) downloaded += 1;
  else if (written === false) skipped += 1;
  else missing += 1;
}

const content = [...posts, ...pages]
  .map((item) => normalizeContent(item, item.type || "post", termMaps, mediaById))
  .sort((a, b) => {
    if (a.type !== b.type) return a.type === "page" ? -1 : 1;
    return a.title.localeCompare(b.title, "fr");
  });

const payload = {
  generatedAt: new Date().toISOString(),
  source: siteBase,
  counts: {
    posts: posts.length,
    pages: pages.length,
    media: media.length,
    content: content.length,
    downloadedMedia: downloaded,
    skippedMedia: skipped,
    missingMedia: missing,
  },
  taxonomies: termMaps,
  content,
};

await mkdir(new URL("../src/data/", import.meta.url), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(`Migrated ${posts.length} posts, ${pages.length} pages and ${media.length} media records.`);
console.log(`Downloaded ${downloaded} media files locally, reused ${skipped} existing files and skipped ${missing} missing files.`);
