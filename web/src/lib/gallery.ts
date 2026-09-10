import type { StructuredSection } from "@/lib/content-types";

export type GalleryImage = {
  src: string;
  alt: string;
};

const FIGURE_RE = /<figure\b[^>]*>[\s\S]*?<\/figure>/gi;
const IMG_RE = /<img\b[^>]*>/gi;

function attr(tag: string, name: string): string {
  const quoted = tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"));
  return quoted?.[1] ?? "";
}

function parseImg(tag: string): GalleryImage | null {
  const src = attr(tag, "src");
  if (!src) return null;
  return { src, alt: attr(tag, "alt") };
}

export function asGalleryImages(value: unknown): GalleryImage[] {
  if (!Array.isArray(value)) return [];
  const images: GalleryImage[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const src = typeof (item as { src?: unknown }).src === "string"
      ? (item as { src: string }).src
      : "";
    if (!src) continue;
    const alt =
      typeof (item as { alt?: unknown }).alt === "string"
        ? (item as { alt: string }).alt
        : "";
    images.push({ src, alt });
  }
  return images;
}

/** Pull imgs out of `<figure>` blocks; leftover HTML is the text around them. */
export function extractGalleryFromHtml(html: string): {
  html: string;
  images: GalleryImage[];
} {
  const images: GalleryImage[] = [];
  const cleaned = html.replace(FIGURE_RE, (figure) => {
    for (const tag of figure.match(IMG_RE) ?? []) {
      const img = parseImg(tag);
      if (img) images.push(img);
    }
    return "";
  });
  return {
    html: cleaned.replace(/(?:<p>\s*<\/p>)+/gi, "").replace(/\n{3,}/g, "\n\n").trim(),
    images,
  };
}

/** Competition write-ups: 2+ photos in a richtext become a `gallery` section. */
export function liftRichtextGalleries(
  sections: StructuredSection[],
): StructuredSection[] {
  const out: StructuredSection[] = [];
  for (const section of sections) {
    if (section.type !== "richtext") {
      out.push(section);
      continue;
    }
    const raw = String(section.props?.html ?? "");
    const { html, images } = extractGalleryFromHtml(raw);
    if (images.length < 2) {
      out.push(section);
      continue;
    }
    if (html) {
      out.push({ ...section, props: { ...section.props, html } });
    }
    out.push({
      type: "gallery",
      id: section.id ? `${section.id}-gallery` : undefined,
      props: { images },
    });
  }
  return out;
}
