import about from "../../content/pages/about.json";
import contactUs from "../../content/pages/contact-us.json";
import memberZone from "../../content/pages/member-zone.json";
import merch from "../../content/pages/merch.json";
import opportunities from "../../content/pages/opportunities.json";
import sponsorships from "../../content/pages/sponsorships.json";
import committeeIndex from "../../content/pages/committee/index.json";
import committee20232024 from "../../content/pages/committee/2023-2024.json";
import committee20252026 from "../../content/pages/committee/2025-2026.json";
import teamSupervisors from "../../content/pages/team/supervisors.json";
import teamWellbeing from "../../content/pages/team/wellbeing.json";
import stagworks from "../../content/pages/stagworks/index.json";
import weatherBalloon from "../../content/pages/stagworks/weather-balloon.json";
import stagworksRf from "../../content/pages/stagworks/rf.json";
import stagworksComposites from "../../content/pages/stagworks/composites.json";
import stagworksFeps from "../../content/pages/stagworks/feps.json";
import rosterNrc2023 from "../../content/pages/rosters/nrc-2023.json";
import rosterTeamMach23 from "../../content/pages/rosters/teammach23.json";
import rosterTeamSdc from "../../content/pages/rosters/teamsdc.json";
import rosterMachXTeams from "../../content/pages/rosters/mach-x-teams.json";
import rosterSdcTeams from "../../content/pages/rosters/satellite-design-competition-teams.json";

import teamIndex from "../../content/team/index.json";
import rosterDataCommitteeCurrent from "../../content/team/rosters/committee-2025-2026.json";
import rosterDataCommittee20232024 from "../../content/team/rosters/committee-2023-2024.json";
import rosterDataTeamMach23 from "../../content/team/rosters/teammach23.json";
import rosterDataTeamSdc from "../../content/team/rosters/teamsdc.json";
import rosterDataMachXTeams from "../../content/team/rosters/mach-x-teams.json";
import rosterDataSdcTeams from "../../content/team/rosters/satellite-design-competition-teams.json";
import rosterDataNrc2023 from "../../content/team/rosters/nrc-2023.json";

import type { StructuredPage } from "@/lib/content-types";
import { getMissionStructuredPages, resolveMissionYears } from "@/lib/missions";
import { getSponsors, hasSponsorsContent } from "@/lib/sponsors";

export type {
  SectionType,
  StructuredPage,
  StructuredSection,
} from "@/lib/content-types";

const shellPages: StructuredPage[] = [
  about,
  contactUs,
  memberZone,
  merch,
  opportunities,
  sponsorships,
  committeeIndex,
  committee20252026,
  committee20232024,
  teamSupervisors,
  teamWellbeing,
  stagworks,
  weatherBalloon,
  stagworksRf,
  stagworksComposites,
  stagworksFeps,
  rosterNrc2023,
  rosterTeamMach23,
  rosterTeamSdc,
  rosterMachXTeams,
  rosterSdcTeams,
] as StructuredPage[];

/** Shell pages first; mission hubs/years override scrape for same slugs. */
const structuredPages: StructuredPage[] = [
  ...shellPages,
  ...getMissionStructuredPages(),
];

const byPath = new Map(structuredPages.map((p) => [p.slug, p]));

/** Legacy scrape / WP slugs → canonical structured pages. */
const STRUCTURED_ALIASES: Record<string, string> = {
  contact: "contact-us",
  "nrc-2": "nationalrocketry",
  competitions: "mach/2022-2023",
  "draft-mach-x": "mach/2023-2024",
  "draft-nrc-2023-2024": "nationalrocketry/2023-2024",
  "draft-race2space": "race2space",
  "draft-ukseds-in-orbit-servicing-and-manufacturing":
    "ukseds-in-orbit-servicing-and-manufacturing",
  "committee-2023-2024-copy": "committee-2025-2026",
};

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

type TeamIndex = {
  supervisors: TeamPerson[];
  wellbeing: TeamPerson[];
  historicalCommittees: HistoricalCommittee[];
};

const team = teamIndex as TeamIndex;

const rostersBySlug = new Map<string, TeamRoster>([
  ["committee-2025-2026", rosterDataCommitteeCurrent as TeamRoster],
  ["committee-2023-2024", rosterDataCommittee20232024 as TeamRoster],
  ["teammach23", rosterDataTeamMach23 as TeamRoster],
  ["teamsdc", rosterDataTeamSdc as TeamRoster],
  ["mach-x-teams", rosterDataMachXTeams as TeamRoster],
  ["satellite-design-competition-teams", rosterDataSdcTeams as TeamRoster],
  ["nrc-2023", rosterDataNrc2023 as TeamRoster],
]);

export function resolvePersonSource(source: string): TeamPerson[] {
  if (source === "team.supervisors") return team.supervisors;
  if (source === "team.wellbeing") return team.wellbeing;
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
    return team.historicalCommittees;
  }
  return [];
}

export { resolveMissionYears };

export type SponsorTierView = {
  id: string;
  title: string;
  entries: { name: string; blurb?: string }[];
};

export function resolveSponsorTiers(): SponsorTierView[] | null {
  if (!hasSponsorsContent()) return null;
  const s = getSponsors();
  const asEntries = (arr: unknown[]) =>
    arr.map((item) => {
      if (typeof item === "string") return { name: item };
      const o = item as { name?: string; blurb?: string };
      return { name: o.name ?? "Partner", blurb: o.blurb };
    });
  return [
    { id: "partnerships", title: "Partnerships", entries: asEntries(s.partnerships) },
    { id: "tier1", title: "Tier 1 sponsors", entries: asEntries(s.tier1) },
    { id: "tier2", title: "Tier 2 sponsors", entries: asEntries(s.tier2) },
  ].filter((t) => t.entries.length > 0);
}
