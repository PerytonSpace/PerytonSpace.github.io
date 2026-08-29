export type SectionType =
  | "heading"
  | "richtext"
  | "image"
  | "cta"
  | "personGrid"
  | "personGroups"
  | "tierList"
  | "yearList"
  | "missionYears"
  | "embedForm"
  | "placeholder";

export type StructuredSection = {
  type: SectionType;
  id?: string;
  props?: Record<string, unknown>;
};

export type StructuredPage = {
  slug: string;
  title: string;
  status?: "draft" | "placeholder" | "published";
  sections: StructuredSection[];
};
