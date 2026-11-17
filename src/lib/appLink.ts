export const APP_BASE_URL = "https://ag.crem.be";
export const INSTALL_URL = "https://ag.crem.be/";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

export function getAppLink(slug: string): string {
  if (!isValidSlug(slug)) {
    throw new Error(`Invalid app slug: ${JSON.stringify(slug)}`);
  }
  return `${APP_BASE_URL}/open/${slug}`;
}

export function tryGetAppLink(slug: string): string | null {
  if (!isValidSlug(slug)) return null;
  return `${APP_BASE_URL}/open/${slug}`;
}
