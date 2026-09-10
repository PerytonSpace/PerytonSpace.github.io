"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import awards from "../../content/site/awards.json";
import siteMedia from "../../content/site/media.json";
import { withBase } from "@/lib/basePath";
import { cardCoverClass, cardCoverStyle } from "@/lib/cardCover";
import {
  hasHomeBrandIntroPlayed,
  HomeBrandIntro,
} from "@/components/HomeBrandIntro";
import {
  annotationAtTime,
  getHeroVideo,
  getHeroVideoAnnotations,
  getHeroVideoFps,
  HOME_TOP_EVENT,
  isOrientationBoundary,
  type ClipOrientation,
} from "@/lib/home";
import { publicAwardHref } from "@/lib/missions";
import { hasSponsorsContent, getSponsors } from "@/lib/sponsors";
import {
  getActivityNavGroups,
  isYearNavChildren,
  site,
  type NavLink,
} from "@/lib/site";

const SLIDES = [
  { id: "video", label: "Intro" },
  { id: "activities", label: "Activities" },
  { id: "achievements", label: "Achievements" },
  { id: "sponsors", label: "Sponsors" },
  { id: "connect", label: "Connect" },
] as const;

type AwardItem = {
  id: string;
  competition: string;
  result: string;
  year: string;
  href?: string;
  note?: string;
  coverImage?: string;
};

const activityCovers = (
  siteMedia as { activityCovers?: Record<string, string> }
).activityCovers ?? {};

function ActivityLink({
  item,
  className = "ps-snap-card-link",
}: {
  item: NavLink;
  className?: string;
}) {
  const soon = item.status === "comingSoon" || !item.href;
  if (soon) {
    return (
      <span
        className={`${className} ps-snap-card-link--soon`}
        aria-label={`${item.label} (Coming soon)`}
      >
        {item.label}
        <span className="ps-nav-soon-tip" aria-hidden="true">
          Coming soon
        </span>
      </span>
    );
  }
  return (
    <Link className={className} href={item.href!}>
      {item.label}
    </Link>
  );
}

function ActivityCompetition({ item }: { item: NavLink }) {
  if (!isYearNavChildren(item)) {
    return <ActivityLink item={item} />;
  }

  return (
    <div className="ps-snap-years">
      <ActivityLink item={item} className="ps-snap-card-link ps-snap-years-label" />
      <ul className="ps-snap-years-flyout" aria-label={`${item.label} years`}>
        {(item.children ?? []).map((year) => (
          <li key={`${item.label}-${year.label}`}>
            <ActivityLink
              item={year}
              className="ps-snap-card-link ps-snap-years-link"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

const WHEEL_THRESHOLD = 70;
const WHEEL_COOLDOWN_MS = 650;
const VIDEO_ANNOTATIONS = getHeroVideoAnnotations();
const VIDEO_FPS = getHeroVideoFps();

function paintFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export function HomeSnap() {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const scrollingRef = useRef(false);
  const accRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSectionRef = useRef<HTMLElement>(null);
  const orientationRef = useRef<ClipOrientation>(
    annotationAtTime(VIDEO_ANNOTATIONS, 0)?.orientation ?? "landscape",
  );
  const cueLabelRef = useRef(
    annotationAtTime(VIDEO_ANNOTATIONS, 0)?.label ?? "",
  );
  const switchingRef = useRef(false);
  const introDoneRef = useRef(hasHomeBrandIntroPlayed());
  const videoSrc = withBase(getHeroVideo());
  const initialCue = annotationAtTime(VIDEO_ANNOTATIONS, 0);
  const [videoCue, setVideoCue] = useState(initialCue?.label ?? "");
  const [clipOrientation, setClipOrientation] = useState<ClipOrientation>(
    initialCue?.orientation ?? "landscape",
  );
  const [videoReady, setVideoReady] = useState(() => hasHomeBrandIntroPlayed());
  const [introDone, setIntroDone] = useState(() => hasHomeBrandIntroPlayed());
  const showSponsors = hasSponsorsContent();
  const sponsors = showSponsors ? getSponsors() : null;
  const awardItems = awards.items as AwardItem[];
  const activityGroups = getActivityNavGroups();

  const onBrandIntroReveal = useCallback(() => {
    // Paint video + cue at full opacity UNDER the still-opaque intro scrim,
    // so the scrim fade reveals them instead of them popping in after it.
    const video = videoRef.current;
    if (video) {
      video.classList.add("is-ready");
      video.currentTime = 0;
      void video.play().catch(() => {
        /* autoplay blocked — user gesture will be needed */
      });
    }
    flushSync(() => {
      setVideoReady(true);
      setIntroDone(true);
    });
  }, []);

  const onBrandIntroComplete = useCallback(() => {
    // Interactions (wheel / keys) stay gated until the fade finishes.
    introDoneRef.current = true;
  }, []);

  const applyOrientationDom = useCallback((next: ClipOrientation) => {
    const section = videoSectionRef.current;
    if (!section) return;
    section.classList.remove(
      "ps-snap-video--landscape",
      "ps-snap-video--portrait",
    );
    section.classList.add(`ps-snap-video--${next}`);
    section.setAttribute("data-clip-orientation", next);
  }, []);

  const goTo = useCallback((i: number) => {
    const next = Math.max(0, Math.min(SLIDES.length - 1, i));
    const el = document.getElementById(`ps-slide-${SLIDES[next].id}`);
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollingRef.current = true;
    indexRef.current = next;
    setIndex(next);
    el.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
    window.setTimeout(() => {
      scrollingRef.current = false;
    }, WHEEL_COOLDOWN_MS);
  }, []);

  useEffect(() => {
    const nodes = SLIDES.map((s) =>
      document.getElementById(`ps-slide-${s.id}`),
    ).filter(Boolean) as HTMLElement[];

    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (scrollingRef.current) return;
        let best: { i: number; ratio: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = nodes.indexOf(entry.target as HTMLElement);
          if (i < 0) continue;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { i, ratio: entry.intersectionRatio };
          }
        }
        if (best && best.ratio >= 0.45) {
          indexRef.current = best.i;
          setIndex(best.i);
        }
      },
      { threshold: [0.45, 0.6, 0.75] },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  // Keep reel paused until the brand intro reveals it.
  useEffect(() => {
    if (videoReady) return;
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }, [videoReady]);

  // Start / resume when ready — covers first reveal and client nav back to home
  // (intro already consumed; play() at reveal can race before the element has data).
  useEffect(() => {
    if (!videoReady) return;
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    const tryPlay = () => {
      if (cancelled || !video.paused) return;
      void video.play().catch(() => {
        /* autoplay blocked — user gesture will be needed */
      });
    };

    tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);

    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
    };
  }, [videoReady]);

  // Frame-accurate cue / orientation sync: pause across orientation flips so
  // object-fit is applied before playback continues past the marked frame.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let raf = 0;
    let cancelled = false;

    const setCueLabel = (label: string) => {
      if (cueLabelRef.current === label) return;
      cueLabelRef.current = label;
      setVideoCue(label);
    };

    const sync = async () => {
      if (cancelled || switchingRef.current) return;

      const active = annotationAtTime(
        VIDEO_ANNOTATIONS,
        video.currentTime,
        VIDEO_FPS,
      );
      const nextLabel = active?.label ?? "";
      const nextOrientation = active?.orientation ?? "landscape";

      if (nextOrientation !== orientationRef.current) {
        switchingRef.current = true;
        const shouldResume = !video.paused;

        video.pause();

        // Hold on the marked boundary frame while fit mode switches.
        if (active && isOrientationBoundary(VIDEO_ANNOTATIONS, active)) {
          const boundaryTime = active.startFrame / VIDEO_FPS;
          if (Math.abs(video.currentTime - boundaryTime) > 1 / (VIDEO_FPS * 2)) {
            await new Promise<void>((resolve) => {
              const onSeeked = () => {
                video.removeEventListener("seeked", onSeeked);
                resolve();
              };
              video.addEventListener("seeked", onSeeked);
              video.currentTime = boundaryTime;
            });
          }
        }

        if (cancelled) {
          switchingRef.current = false;
          return;
        }

        orientationRef.current = nextOrientation;
        applyOrientationDom(nextOrientation);
        setClipOrientation(nextOrientation);
        setCueLabel(nextLabel);

        // Force layout so object-fit is committed before frames advance.
        void videoSectionRef.current?.offsetHeight;
        await paintFrame();
        if (cancelled) {
          switchingRef.current = false;
          return;
        }

        if (shouldResume) {
          try {
            await video.play();
          } catch {
            /* autoplay / interruption — ignore */
          }
        }
        switchingRef.current = false;
        return;
      }

      setCueLabel(nextLabel);
    };

    const tick = () => {
      void sync().finally(() => {
        if (cancelled) return;
        if (!video.paused && !video.ended) {
          raf = requestAnimationFrame(tick);
        }
      });
    };

    const startLoop = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };

    const onPlay = () => startLoop();
    const onSeeked = () => {
      void sync();
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("seeked", onSeeked);
    void sync();
    if (!video.paused) startLoop();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("seeked", onSeeked);
    };
  }, [applyOrientationDom]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onWheel = (e: WheelEvent) => {
      if (!introDoneRef.current) {
        e.preventDefault();
        return;
      }
      if (reduced) return;
      if (Math.abs(e.deltaY) < 2) return;
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

      e.preventDefault();
      if (scrollingRef.current) return;

      accRef.current += e.deltaY;
      if (Math.abs(accRef.current) < WHEEL_THRESHOLD) return;

      const dir = accRef.current > 0 ? 1 : -1;
      accRef.current = 0;
      goTo(indexRef.current + dir);
    };

    const onKey = (e: KeyboardEvent) => {
      if (!introDoneRef.current) {
        if (
          e.key === "ArrowDown" ||
          e.key === "ArrowUp" ||
          e.key === "PageDown" ||
          e.key === "PageUp" ||
          e.key === "Home" ||
          e.key === "End" ||
          e.key === " "
        ) {
          e.preventDefault();
        }
        return;
      }
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goTo(indexRef.current + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goTo(indexRef.current - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(SLIDES.length - 1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [goTo]);

  useEffect(() => {
    const onHomeTop = () => goTo(0);
    window.addEventListener(HOME_TOP_EVENT, onHomeTop);
    return () => window.removeEventListener(HOME_TOP_EVENT, onHomeTop);
  }, [goTo]);

  return (
    <div
      id="wp--skip-link--target"
      className={`ps-snap${introDone ? "" : " ps-snap--intro"}`}
    >
      <HomeBrandIntro
        onReveal={onBrandIntroReveal}
        onComplete={onBrandIntroComplete}
      />

      {/* 1 — Video */}
      <section
        ref={videoSectionRef}
        id="ps-slide-video"
        className={`ps-snap-slide ps-snap-video ps-snap-video--${clipOrientation}`}
        data-clip-orientation={clipOrientation}
        aria-label="Intro"
      >
        <video
          ref={videoRef}
          className={`ps-snap-video-el${videoReady ? " is-ready" : ""}`}
          autoPlay={videoReady}
          muted
          loop
          playsInline
          preload="auto"
          src={videoSrc}
        />
        <div className="ps-snap-video-shade" aria-hidden />
        <div className="ps-snap-wordmark">
          <h1 className="ps-snap-wordmark-title">{site.name}</h1>
          <p className="ps-snap-wordmark-sub">
            university of surrey UKSEDS branch
          </p>
        </div>
        {videoCue ? (
          <p className="ps-snap-video-cue" aria-live="polite">
            <span className="ps-snap-video-cue-mark" aria-hidden />
            <span className="ps-snap-video-cue-label" key={videoCue}>
              {videoCue}
            </span>
          </p>
        ) : null}
      </section>

      <button
        type="button"
        className={`ps-snap-scroll-hint${introDone && index === 0 ? " is-visible" : ""}`}
        aria-label="Scroll to next section"
        tabIndex={introDone && index === 0 ? 0 : -1}
        aria-hidden={!(introDone && index === 0)}
        onClick={() => goTo(1)}
      >
        <span className="ps-snap-scroll-hint-motion">
          <span className="ps-snap-scroll-hint-label">Scroll</span>
          <span className="ps-snap-scroll-hint-chevron" aria-hidden />
        </span>
      </button>

      {/* 2 — Activities */}
      <section
        id="ps-slide-activities"
        className="ps-snap-slide ps-snap-panel"
        aria-label="Activities"
      >
        <div className="ps-snap-inner">
          <h2 className="ps-snap-title">What we do</h2>
          <p className="ps-snap-sub">
            Same groups as the menu — Launch, Missions, and StagWorks.
          </p>
          <ul className="ps-snap-cards">
            {activityGroups.map((group) => {
              const cover = activityCovers[group.label];
              return (
                <li
                  key={group.label}
                  className={`ps-snap-card ${cardCoverClass(cover)}`.trim()}
                  style={cardCoverStyle(cover)}
                >
                  <h3 className="ps-snap-card-title">{group.label}</h3>
                  <ul className="ps-snap-card-links ps-snap-card-links--stack">
                    {(group.children ?? []).map((child) => (
                      <li key={`${group.label}-${child.label}`}>
                        <ActivityCompetition item={child} />
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 3 — Achievements */}
      <section
        id="ps-slide-achievements"
        className="ps-snap-slide ps-snap-panel ps-snap-panel--muted"
        aria-label="Achievements"
      >
        <div className="ps-snap-inner">
          <h2 className="ps-snap-title">{awards.title}</h2>
          <p className="ps-snap-sub">
            Competition highlights — details grow as write-ups land.
          </p>
          <ul className="ps-awards-grid">
            {awardItems.map((item) => {
              const body = (
                <>
                  <span className="ps-awards-result">{item.result}</span>
                  <span className="ps-awards-comp">{item.competition}</span>
                  <span className="ps-awards-year">{item.year}</span>
                </>
              );
              const href = publicAwardHref(item.href);
              return (
                <li key={item.id} className="ps-awards-item">
                  {href ? (
                    <Link
                      className={`ps-awards-card ${cardCoverClass(item.coverImage)}`.trim()}
                      href={href}
                      style={cardCoverStyle(item.coverImage)}
                    >
                      {body}
                    </Link>
                  ) : (
                    <div
                      className={`ps-awards-card ${cardCoverClass(item.coverImage)}`.trim()}
                      style={cardCoverStyle(item.coverImage)}
                    >
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 4 — Sponsors */}
      <section
        id="ps-slide-sponsors"
        className="ps-snap-slide ps-snap-panel"
        aria-label="Sponsors"
      >
        <div className="ps-snap-inner">
          <h2 className="ps-snap-title">Partners & sponsors</h2>
          {showSponsors && sponsors ? (
            <>
              <p className="ps-snap-sub">
                Organisations supporting student space engineering at Surrey.
              </p>
              <div className="ps-tiers">
                {(
                  [
                    ["Partnerships", sponsors.partnerships],
                    ["Tier 1", sponsors.tier1],
                    ["Tier 2", sponsors.tier2],
                  ] as const
                ).map(([title, list]) =>
                  list.length ? (
                    <section key={title} className="ps-tier">
                      <h3 className="ps-tier-title">{title}</h3>
                      <ul className="ps-sponsor-grid">
                        {list.map((item, i) => {
                          const name =
                            typeof item === "string"
                              ? item
                              : String(
                                  (item as { name?: string }).name ?? "Partner",
                                );
                          const logo =
                            typeof item === "string"
                              ? undefined
                              : (item as { logo?: string }).logo;
                          return (
                            <li key={`${name}-${i}`} className="ps-sponsor-card">
                              {logo ? (
                                <img
                                  className="ps-sponsor-logo"
                                  src={withBase(logo)}
                                  alt=""
                                />
                              ) : null}
                              <strong>{name}</strong>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ) : null,
                )}
              </div>
              <p className="ps-cta">
                <Link href="/sponsorships/">Partners &amp; sponsors</Link>
              </p>
            </>
          ) : (
            <>
              <p className="ps-snap-sub">
                We’re building a partnerships programme — product support,
                sponsorship tiers, and careers talks. Nothing public yet.
              </p>
              <p className="ps-cta">
                <Link href="/contact-us/">Talk to us about partnering</Link>
              </p>
            </>
          )}
        </div>
      </section>

      {/* 5 — Member Zone + Contact */}
      <section
        id="ps-slide-connect"
        className="ps-snap-slide ps-snap-panel ps-snap-panel--muted"
        aria-label="Member Zone and Contact"
      >
        <div className="ps-snap-inner">
          <h2 className="ps-snap-title">Get involved</h2>
          <p className="ps-snap-sub">
            Resources for members and peers, plus ways to reach the society.
          </p>
          <ul className="ps-snap-cards ps-snap-cards--two">
            <li className="ps-snap-card">
              <h3 className="ps-snap-card-title">
                <Link href="/member-zone/">Member Zone</Link>
              </h3>
              <p className="ps-snap-card-blurb">
                Public workshop notes, courses (composites & electronics), and
                how we make things. No login — email/phone on request via
                society channels.
              </p>
              <p className="ps-cta">
                <Link href="/member-zone/">Open Member Zone</Link>
              </p>
            </li>
            <li className="ps-snap-card">
              <h3 className="ps-snap-card-title">
                <Link href="/contact-us/">Contact</Link>
              </h3>
              <p className="ps-snap-card-blurb">
                Questions, collaboration, or sponsorship — send a message.
              </p>
              <p className="ps-cta">
                <Link href="/contact-us/">Contact us</Link>
              </p>
            </li>
          </ul>
        </div>
      </section>

      <div className="ps-snap-chrome" aria-label="Section navigation">
        <button
          type="button"
          className="ps-snap-btn"
          aria-label="Previous section"
          disabled={index <= 0}
          onClick={() => goTo(index - 1)}
        >
          ↑
        </button>
        <ol className="ps-snap-dots">
          {SLIDES.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className={`ps-snap-dot${i === index ? " is-active" : ""}`}
                aria-label={`Go to ${s.label}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => goTo(i)}
              />
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="ps-snap-btn"
          aria-label="Next section"
          disabled={index >= SLIDES.length - 1}
          onClick={() => goTo(index + 1)}
        >
          ↓
        </button>
      </div>
    </div>
  );
}
