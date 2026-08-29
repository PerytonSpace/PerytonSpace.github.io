import siteMedia from "../../content/site/media.json";
import { site } from "@/lib/site";

export type ClipOrientation = "landscape" | "portrait";

export type HeroVideoAnnotation = {
  /** 0-based frame index at heroVideoFps. */
  startFrame: number;
  label: string;
  /** Source framing inside the 16:9 reel — portrait = phone/Mach vertical clips. */
  orientation: ClipOrientation;
};

type RawAnnotation = {
  startFrame?: number;
  label?: string;
  orientation?: string;
};

type SiteMediaAnnotations = {
  heroVideoFps?: number;
  heroVideoAnnotations?: RawAnnotation[];
};

function parseOrientation(value: unknown): ClipOrientation {
  return value === "portrait" ? "portrait" : "landscape";
}

/** Apply configurable hero video + strip inconsistent legacy award badge gallery. */
export function prepareHomeHtml(html: string): string {
  const video = siteMedia.heroVideo || site.heroVideo;
  let out = html.replace(
    /(<video[^>]*class="[^"]*ps-hero-video[^"]*"[^>]*src=")[^"]+(")/i,
    `$1${video}$2`,
  );
  out = out.replace(
    /(<video[^>]*src=")[^"]+("[^>]*class="[^"]*ps-hero-video[^"]*")/i,
    `$1${video}$2`,
  );

  // Legacy leaf/badge collage (inconsistent assets) — replaced by AwardsStrip
  out = out.replace(
    /<div class="wp-block-group alignfull is-layout-flow wp-container-core-group-is-layout-0364089a[\s\S]*$/i,
    "",
  );

  return out;
}

export function getHeroVideo(): string {
  return siteMedia.heroVideo || site.heroVideo;
}

export function getHeroVideoFps(): number {
  const fps = (siteMedia as SiteMediaAnnotations).heroVideoFps;
  return typeof fps === "number" && fps > 0 ? fps : 30;
}

export function getHeroVideoAnnotations(): HeroVideoAnnotation[] {
  const raw = (siteMedia as SiteMediaAnnotations).heroVideoAnnotations;
  if (!Array.isArray(raw) || !raw.length) return [];
  return [...raw]
    .filter(
      (a) =>
        a &&
        typeof a.startFrame === "number" &&
        Number.isFinite(a.startFrame) &&
        a.startFrame >= 0 &&
        typeof a.label === "string" &&
        a.label.trim(),
    )
    .map((a) => ({
      startFrame: Math.round(a.startFrame!),
      label: a.label!.trim(),
      orientation: parseOrientation(a.orientation),
    }))
    .sort((a, b) => a.startFrame - b.startFrame);
}

/** Active cue for a frame index (last annotation with startFrame ≤ frame). */
export function annotationAtFrame(
  annotations: HeroVideoAnnotation[],
  frame: number,
): HeroVideoAnnotation | null {
  if (!annotations.length) return null;
  let active: HeroVideoAnnotation | null = null;
  for (const a of annotations) {
    if (a.startFrame <= frame) active = a;
    else break;
  }
  return active;
}

/** Active cue for a playback time (frame-quantized via fps). */
export function annotationAtTime(
  annotations: HeroVideoAnnotation[],
  timeSec: number,
  fps: number = getHeroVideoFps(),
): HeroVideoAnnotation | null {
  // Floor so we don't apply the next cue before its marked frame.
  const frame = Math.floor(timeSec * fps + 1e-9);
  return annotationAtFrame(annotations, frame);
}

/** True when this cue starts a different orientation than the previous cue. */
export function isOrientationBoundary(
  annotations: HeroVideoAnnotation[],
  cue: HeroVideoAnnotation | null,
): boolean {
  if (!cue) return false;
  const i = annotations.indexOf(cue);
  if (i <= 0) return true;
  return annotations[i - 1]!.orientation !== cue.orientation;
}
