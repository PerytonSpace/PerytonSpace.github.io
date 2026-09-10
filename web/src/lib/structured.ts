import { catalog } from "@/lib/catalog";
import type { StructuredPage } from "@/lib/content-types";
import { getMissionStructuredPages, resolveMissionYears } from "@/lib/missions";
import { getSponsors, hasSponsorsContent } from "@/lib/sponsors";

export type {
  SectionType,
  StructuredPage,
  StructuredSection,
} from "@/lib/content-types";

/** Shell pages first; mission hubs/years override scrape for same slugs. */
const structuredPages: StructuredPage[] = [
  ...(catalog.pages as StructuredPage[]),
  ...getMissionStructuredPages(),
];

const byPath = new Map(structuredPages.map((p) => [p.slug, p]));

/** Legacy scrape / WP slugs → canonical structured pages. */
const STRUCTURED_ALIASES: Record<string, string> = { ...catalog.aliases };

export function getStructuredPage(routePath: string): StructuredPage | undefined {
  const normalized = routePath.replace(/^\/|\/$/g, "");
  const aliased = STRUCTURED_ALIASES[normalized];
  if (aliased) return byPath.get(aliased);
  return byPath.get(normalized);
}

export function getStructuredStaticPaths(): { slug: string[] }[] {
  const pages = structuredPages.map((p) => ({ slug: p.slug.split("/") }));
  for (const alias of Object.keys(STRUCTURED_ALIASES)) {
    pages.push({ slug: alias.split("/") });
  }
  return pages;
}

export function getAllStructuredPaths(): string[] {
  return structuredPages.map((p) => p.slug);
}

export type TeamPerson = {
  name: string;
  role: string;
  photo?: string | null;
  linkedin?: string | null;
  note?: string;
};

export type PersonGroup = {
  title?: string;
  members: TeamPerson[];
};

export type TeamRoster = {
  title: string;
  status?: string;
  groups: PersonGroup[];
};

export type HistoricalCommittee = {
  year: string;
  href: string;
  label: string;
  current?: boolean;
};

const team = catalog.team;

const rostersBySlug = new Map<string, TeamRoster>(
  Object.entries(team.rosters) as [string, TeamRoster][],
);

export function resolvePersonSource(source: string): TeamPerson[] {
  if (source === "team.supervisors") return team.supervisors as TeamPerson[];
  if (source === "team.wellbeing") return team.wellbeing as TeamPerson[];
  return [];
}

export function resolvePersonGroups(source: string): PersonGroup[] {
  const prefix = "team.rosters.";
  if (!source.startsWith(prefix)) return [];
  const key = source.slice(prefix.length);
  return rostersBySlug.get(key)?.groups ?? [];
}

export function resolveYearListSource(source: string): HistoricalCommittee[] {
  if (source === "team.historicalCommittees") {
    return team.historicalCommittees as HistoricalCommittee[];
  }
  return [];
}

export { resolveMissionYears };

export type SponsorTierView = {
  id: string;
  title: string;
  entries: { name: string; blurb?: string; logo?: string }[];
};

export function resolveSponsorTiers(): SponsorTierView[] | null {
  if (!hasSponsorsContent()) return null;
  const s = getSponsors();
  const asEntries = (arr: unknown[]) =>
    arr.map((item) => {
      if (typeof item === "string") return { name: item };
      const o = item as { name?: string; blurb?: string; logo?: string };
      return { name: o.name ?? "Partner", blurb: o.blurb, logo: o.logo };
    });
  return [
    { id: "partnerships", title: "Partnerships", entries: asEntries(s.partnerships) },
    { id: "tier1", title: "Tier 1 sponsors", entries: asEntries(s.tier1) },
    { id: "tier2", title: "Tier 2 sponsors", entries: asEntries(s.tier2) },
  ].filter((t) => t.entries.length > 0);
}
