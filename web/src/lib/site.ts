import siteMedia from "../../content/site/media.json";
import { missionYearNavLinks } from "@/lib/missions";
import { hasSponsorsContent } from "@/lib/sponsors";

export const site = {
  name: "Peryton Space",
  tagline: "The University of Surrey's UKSEDS Branch and Space Society",
  logo: "/wp-content/uploads/2024/01/transparentlogo.png",
  /** Prefer `content/site/media.json` — this is the fallback default. */
  heroVideo: siteMedia.heroVideo,
} as const;

/**
 * Committee header prototypes (Phase 1).
 * Flip between "drawer" and "rail" for review; default is drawer.
 */
export type HeaderPrototype = "drawer" | "rail";
export const headerPrototype: HeaderPrototype = "drawer";

export type NavItemStatus = "live" | "comingSoon";

export type NavLink = {
  label: string;
  href?: string;
  status?: NavItemStatus;
  children?: NavLink[];
};

/** Year rows under a multi-year competition (labels like "2024–2025"). */
export function isYearNavChildren(item: NavLink): boolean {
  const kids = item.children;
  if (!kids?.length) return false;
  return kids.every(
    (c) => !c.children?.length && /^\d{4}/.test(c.label.trim()),
  );
}

export type NavItem = {
  label: string;
  href?: string;
  status?: NavItemStatus;
  children?: NavLink[];
};

const baseNavigation: NavItem[] = [
  {
    label: "Launch",
    children: [
      {
        label: "National Rocketry Championship",
        href: "/nationalrocketry",
        children: missionYearNavLinks("nrc"),
      },
      {
        label: "Mach-X",
        href: "/mach",
        children: missionYearNavLinks("mach"),
      },
      {
        label: "Race2Space",
        href: "/race2space",
        children: missionYearNavLinks("race2space"),
      },
      {
        label: "Launch4Change",
        href: "/launch4change",
        children: missionYearNavLinks("l4c"),
      },
    ],
  },
  {
    label: "Missions",
    children: [
      { label: "Olympus Rover Trials", href: "/olympus-rover-trials" },
      {
        label: "Satellite Design Competition",
        href: "/satellite-design-competition",
        children: missionYearNavLinks("sdc"),
      },
      {
        label: "IOSM",
        href: "/ukseds-in-orbit-servicing-and-manufacturing",
      },
    ],
  },
  {
    label: "StagWorks",
    children: [
      { label: "Overview", href: "/stagworks" },
      { label: "Weather Balloon", href: "/weather-balloon-division" },
      { label: "RF experiments", href: "/stagworks/rf" },
      { label: "Composite testing", href: "/stagworks/composites" },
      { label: "FEPS boards", href: "/stagworks/feps" },
    ],
  },
  {
    label: "Our Team",
    children: [
      {
        label: "Current Committee",
        href: "/committee-2026-2027",
      },
      { label: "Historical Committees", href: "/committee" },
      { label: "Academic Supervisors", href: "/team/supervisors" },
      { label: "Wellbeing Champions", href: "/team/wellbeing" },
    ],
  },
  {
    label: "About",
    children: [
      { label: "Who We Are", href: "/about" },
      { label: "Ethos", href: "/about#ethos" },
    ],
  },
  {
    label: "Member Zone",
    href: "/member-zone",
  },
  {
    label: "Contact",
    children: [
      { label: "Contact Us", href: "/contact-us" },
      { label: "Sponsors / Partnerships", href: "/sponsorships" },
    ],
  },
];

function filterSponsorsFromNav(items: NavItem[]): NavItem[] {
  if (hasSponsorsContent()) return items;

  return items.map((item) => {
    if (item.label !== "Contact" || !item.children) return item;
    return {
      ...item,
      children: item.children.filter(
        (child) => child.label !== "Sponsors / Partnerships",
      ),
    };
  });
}

/** Navigation with sponsors hidden when content.json sponsors are empty. */
export function getNavigation(): NavItem[] {
  return filterSponsorsFromNav(baseNavigation);
}

/** Top activity groups as in the burger sidebar: Launch, Missions, StagWorks. */
export function getActivityNavGroups(): NavItem[] {
  return baseNavigation.filter((item) =>
    ["Launch", "Missions", "StagWorks"].includes(item.label),
  );
}

/** @deprecated Prefer getNavigation() — kept for any static imports. */
export const navigation = getNavigation();

export const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/perytonspace/",
    icon: "instagram",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/peryton-space/mycompany/",
    icon: "linkedin",
  },
  {
    label: "GitHub",
    href: "https://github.com/PerytonSpace",
    icon: "github",
  },
] as const;
