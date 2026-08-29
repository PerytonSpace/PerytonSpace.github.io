import sponsorsData from "../../content/site/sponsors.json";

export type SponsorsFile = {
  partnerships: unknown[];
  tier1: unknown[];
  tier2: unknown[];
};

const data = sponsorsData as SponsorsFile;

/** Empty or missing sponsor lists ⇒ hide Sponsors nav/section entirely. */
export function hasSponsorsContent(): boolean {
  return (
    data.partnerships.length > 0 ||
    data.tier1.length > 0 ||
    data.tier2.length > 0
  );
}

export function getSponsors(): SponsorsFile {
  return data;
}
