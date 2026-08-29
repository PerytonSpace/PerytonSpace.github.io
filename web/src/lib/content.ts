import pagesData from "../../content/scrape/pages.json";
import {
  getStructuredPage,
  getStructuredStaticPaths,
} from "@/lib/structured";

export type Page = {
  slug: string;
  path: string;
  title: string;
  content: string;
};

type PagesFile = {
  pages: Page[];
  pathToSlug: Record<string, string>;
};

const data = pagesData as PagesFile;

export function getAllPages(): Page[] {
  return data.pages;
}

export function getPageByPath(routePath: string): Page | undefined {
  const normalized = routePath.replace(/^\/|\/$/g, "");
  return data.pages.find((p) => p.path === normalized);
}

/** Prefer structured JSON pages over scraped HTML when both exist. */
export function resolvePage(routePath: string) {
  const normalized = routePath.replace(/^\/|\/$/g, "");
  const structured = getStructuredPage(normalized);
  if (structured) return { kind: "structured" as const, page: structured };
  const scraped = getPageByPath(normalized);
  if (scraped) return { kind: "scraped" as const, page: scraped };
  return null;
}

export function getStaticPaths(): { slug: string[] }[] {
  const scraped = data.pages
    .filter((p) => p.path !== "")
    .map((p) => ({ slug: p.path.split("/") }));

  const structured = getStructuredStaticPaths();
  const seen = new Set(scraped.map((s) => s.slug.join("/")));

  for (const s of structured) {
    const key = s.slug.join("/");
    if (!seen.has(key)) {
      scraped.push(s);
      seen.add(key);
    }
  }

  // Structured overrides: ensure paths exist even if scrape had same path
  for (const s of structured) {
    const key = s.slug.join("/");
    if (!seen.has(key)) {
      scraped.push(s);
      seen.add(key);
    }
  }

  return scraped;
}

export function getHomePage(): Page {
  const home =
    data.pages.find((p) => p.path === "") ??
    data.pages.find((p) => p.slug === "home") ??
    data.pages.find((p) => p.path === "page_id_168");
  if (!home) throw new Error("Home page not found in content/scrape/pages.json");
  return home;
}
