import missionsFile from "../../content/missions/index.json";
import type { StructuredPage, StructuredSection } from "@/lib/content-types";

type MissionNavLink = {
  label: string;
  href?: string;
  status?: "live" | "comingSoon";
};

export type MissionYear = {
  id: string;
  label: string;
  status: "live" | "placeholder" | "comingSoon" | "published";
  summary: string;
  highlights: string[];
  awards: string[];
  intake?: string;
  /** Optional rich sections (media, tech notes) after the summary block. */
  extraSections?: StructuredSection[];
};

export type MissionRelatedLink = { label: string; href: string };

export type Mission = {
  id: string;
  group: "launch" | "missions";
  navLabel: string;
  hubSlug: string;
  title: string;
  introHtml: string;
  relatedLinks: MissionRelatedLink[];
  years: MissionYear[];
  extraSections?: StructuredSection[];
};

export type IntakeItem = {
  label: string;
  owner: string;
  done: boolean;
  deferred?: boolean;
  note?: string;
};

type MissionsFile = {
  missions: Mission[];
  intake: Record<string, IntakeItem>;
};

const data = missionsFile as MissionsFile;

export function getMissions(): Mission[] {
  return data.missions;
}

export function getMission(id: string): Mission | undefined {
  return data.missions.find((m) => m.id === id);
}

export function getMissionByHubSlug(slug: string): Mission | undefined {
  return data.missions.find((m) => m.hubSlug === slug);
}

export function yearHref(mission: Mission, year: MissionYear): string {
  return `/${mission.hubSlug}/${year.id}`;
}

/** Published years are linked; placeholder / comingSoon stay grey in menus (COMP-05). */
export function yearIsNavigable(year: MissionYear): boolean {
  return year.status === "published" || year.status === "live";
}

/** Nav children for a mission hub (years + comingSoon). */
export function missionYearNavLinks(missionId: string): MissionNavLink[] {
  const mission = getMission(missionId);
  if (!mission) return [];
  return mission.years.map((year) => {
    if (yearIsNavigable(year)) {
      return {
        label: year.label,
        href: yearHref(mission, year),
        status: "live" as const,
      };
    }
    return { label: year.label, status: "comingSoon" as const };
  });
}

export function getIntake(): Record<string, IntakeItem> {
  return data.intake;
}

function relatedLinksSection(mission: Mission): StructuredSection[] {
  if (!mission.relatedLinks.length) return [];
  const items = mission.relatedLinks
    .map((l) => `<li><a href="${l.href}">${l.label}</a></li>`)
    .join("");
  return [
    { type: "heading", props: { text: "Related", level: 2 } },
    { type: "richtext", props: { html: `<ul>${items}</ul>` } },
  ];
}

export function buildMissionHubPage(mission: Mission): StructuredPage {
  const sections: StructuredSection[] = [
    { type: "heading", props: { text: mission.title, level: 1 } },
    { type: "richtext", props: { html: mission.introHtml } },
    ...(mission.extraSections ?? []),
  ];

  if (mission.years.length) {
    sections.push({
      type: "heading",
      props: { text: "By year", level: 2 },
    });
    sections.push({
      type: "missionYears",
      props: { missionId: mission.id },
    });
  }

  sections.push(...relatedLinksSection(mission));

  return {
    slug: mission.hubSlug,
    title: mission.title,
    status: "published",
    sections,
  };
}

export function buildMissionYearPage(
  mission: Mission,
  year: MissionYear,
): StructuredPage {
  const back = {
    type: "cta" as const,
    props: { label: `Back to ${mission.title}`, href: `/${mission.hubSlug}/` },
  };

  if (!yearIsNavigable(year)) {
    return {
      slug: `${mission.hubSlug}/${year.id}`,
      title: `${mission.title} ${year.label}`,
      status: "published",
      sections: [
        {
          type: "heading",
          props: { text: `${mission.title} — ${year.label}`, level: 1 },
        },
        {
          type: "placeholder",
          props: {
            title: "Coming soon",
            body: "This year’s write-up isn’t published yet.",
          },
        },
        back,
      ],
    };
  }

  const awardHtml = year.awards.length
    ? `<p><strong>Awards:</strong> ${year.awards.join("; ")}</p>`
    : "";
  const highlightsHtml = year.highlights.length
    ? `<ul>${year.highlights.map((h) => `<li>${h}</li>`).join("")}</ul>`
    : "";

  return {
    slug: `${mission.hubSlug}/${year.id}`,
    title: `${mission.title} ${year.label}`,
    status: "published",
    sections: [
      {
        type: "heading",
        props: { text: `${mission.title} — ${year.label}`, level: 1 },
      },
      {
        type: "richtext",
        props: {
          html: `<p>${year.summary}</p>${awardHtml}${highlightsHtml}`,
        },
      },
      ...(year.extraSections ?? []),
      back,
    ],
  };
}

/** Synthesized structured pages for all mission hubs + years (unpublished years are Coming soon shells). */
export function getMissionStructuredPages(): StructuredPage[] {
  const pages: StructuredPage[] = [];
  for (const mission of data.missions) {
    pages.push(buildMissionHubPage(mission));
    for (const year of mission.years) {
      pages.push(buildMissionYearPage(mission, year));
    }
  }
  return pages;
}

export function resolveMissionYears(missionId: string): {
  mission: Mission;
  years: MissionYear[];
} | null {
  const mission = getMission(missionId);
  if (!mission) return null;
  return { mission, years: mission.years };
}
