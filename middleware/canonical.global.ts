// @ts-nocheck
import { URL_SETTINGS } from "~/url-scheme.config.js";

const normalizeParam = (value: unknown): string => {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
};

const parseCreatePath = (value: string) => {
  let decoded = value;
  try { decoded = decodeURIComponent(value); } catch { decoded = value; }
  const parts = decoded.split("/").filter(Boolean);
  return {
    year: parts.find((p) => /^\d{4}$/.test(p)) || "",
    lang: parts.find((p) => p === "ja" || p === "en") || "",
  };
};

const EXPO_ENDS = [
  "2025-10-13T20:00:00+09:00",
  "2027-09-26T00:00:00+09:00",
  "2031-03-31T00:00:00+03:00",
];
const EXPO_YEARS = ["2025", "2027", "2030"];

const getFallbackYear = () => {
  const now = Date.now();
  const futureIndex = EXPO_ENDS.findIndex((endAt) => new Date(endAt).getTime() > now);
  return EXPO_YEARS[futureIndex >= 0 ? futureIndex : EXPO_YEARS.length - 1];
};

const buildCanonicalPath = (year: string, lang: string) => `/${year}/${lang}`;

const stripBasePath = (path: string, baseURL: string) => {
  const normalizedBase = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  if (!normalizedBase || normalizedBase === "/") return path;
  if (path === normalizedBase) return "/";
  if (path.startsWith(`${normalizedBase}/`)) return path.slice(normalizedBase.length);
  return path;
};

export default defineNuxtRouteMiddleware((to) => {
  if (URL_SETTINGS.urlScheme !== "path") return;

  const runtimeConfig = useRuntimeConfig();
  const baseURL = String(runtimeConfig.app?.baseURL || "/");
  const relativePath = stripBasePath(to.path, baseURL);
  const pathParts = relativePath.split("/").filter(Boolean);

  const yearFromPath = pathParts.find((part) => /^\d{4}$/.test(part)) || "";
  const langFromPath = pathParts.find((part) => part === "ja" || part === "en") || "";

  const cp =
    normalizeParam(to.query.createPath) ||
    normalizeParam(to.query.createpath) ||
    normalizeParam(to.query.clearPath) ||
    normalizeParam(to.query.clearpath);
  const fromCp = cp ? parseCreatePath(cp) : { year: "", lang: "" };

  const yearFromQuery = normalizeParam(to.query.year);
  const langFromQuery = normalizeParam(to.query.lang);

  const shouldCanonicalizePath = pathParts.length > 0 || Boolean(cp || yearFromQuery || langFromQuery);
  if (!shouldCanonicalizePath) return;

  const targetYear = fromCp.year || yearFromQuery || yearFromPath || getFallbackYear();
  const rawTargetLang = fromCp.lang || langFromQuery || langFromPath;
  const targetLang = rawTargetLang === "en" || rawTargetLang === "ja" ? rawTargetLang : "ja";

  const cleanedQuery = { ...to.query } as Record<string, unknown>;
  delete cleanedQuery.year;
  delete cleanedQuery.lang;
  delete cleanedQuery.createPath;
  delete cleanedQuery.createpath;
  delete cleanedQuery.clearPath;
  delete cleanedQuery.clearpath;

  const targetPath = buildCanonicalPath(targetYear, targetLang);

  const hasLegacyHints = Boolean(
    to.query.year || to.query.lang ||
    to.query.createPath || to.query.createpath ||
    to.query.clearPath || to.query.clearpath,
  );

  // Normalize trailing slash for comparison (Cloudflare adds / for HTML files)
  const normalizedPath = relativePath.endsWith("/") ? relativePath.slice(0, -1) : relativePath;
  if (normalizedPath === targetPath && !hasLegacyHints) return;

  return navigateTo(
    { path: targetPath, query: cleanedQuery, hash: to.hash },
    { replace: true, redirectCode: 301 },
  );
});
