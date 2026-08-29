"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { site } from "@/lib/site";

/** Module-scoped: resets on full reload; survives client navigations in-session. */
let homeBrandIntroConsumed = false;

export function hasHomeBrandIntroPlayed(): boolean {
  return homeBrandIntroConsumed;
}

const HOLD_MS = 500;
const COLLAPSE_MS = 850;
const FADE_MS = 650;
/** Expanded header logo size in rem — tracks html font-size. */
const EXPANDED_MAX_REM = 17.5;

type Phase = "hold" | "collapse" | "fade" | "done";

type Props = {
  onReveal: () => void;
  onComplete: () => void;
};

function headerLogoEl(): HTMLElement | null {
  return (
    document.getElementById("ps-header-logo") ??
    document.querySelector<HTMLElement>(".ps-header .ps-logo")
  );
}

function clearLogoInline(logo: HTMLElement) {
  logo.style.transition = "";
  logo.style.transform = "";
  logo.style.transformOrigin = "";
  logo.style.willChange = "";
  logo.style.filter = "";
  logo.classList.remove("ps-header-logo--intro");
}

export function HomeBrandIntro({ onReveal, onComplete }: Props) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>(() =>
    homeBrandIntroConsumed ? "done" : "hold",
  );
  const onRevealRef = useRef(onReveal);
  const onCompleteRef = useRef(onComplete);
  const revealedRef = useRef(homeBrandIntroConsumed);
  const finishedRef = useRef(homeBrandIntroConsumed);
  const timersRef = useRef<number[]>([]);

  onRevealRef.current = onReveal;
  onCompleteRef.current = onComplete;

  /** Prep video/chrome under the black scrim, then fade scrim + chrome together. */
  const reveal = () => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    // Sync: video is-ready + drop --intro while still covered by opaque scrim.
    onRevealRef.current();
    // Next frames: start scrim/chrome fade once prep styles have painted.
    const raf1 = window.requestAnimationFrame(() => {
      const raf2 = window.requestAnimationFrame(() => {
        document.body.classList.add("ps-home-intro-fading");
        setPhase("fade");
        const fadeTimer = window.setTimeout(finish, FADE_MS);
        timersRef.current.push(fadeTimer);
      });
      timersRef.current.push(raf2 as unknown as number);
    });
    timersRef.current.push(raf1 as unknown as number);
  };

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    homeBrandIntroConsumed = true;
    const logo = headerLogoEl();
    if (logo) clearLogoInline(logo);
    document.body.classList.remove(
      "ps-home-intro-active",
      "ps-home-intro-fading",
    );
    setPhase("done");
    onCompleteRef.current();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (phase === "done") return;
    document.body.classList.add("ps-home-intro-active");
    return () => {
      document.body.classList.remove(
        "ps-home-intro-active",
        "ps-home-intro-fading",
      );
    };
  }, [phase]);

  // Expand the REAL header logo before paint, then collapse it into its slot.
  useLayoutEffect(() => {
    if (homeBrandIntroConsumed) {
      revealedRef.current = true;
      finishedRef.current = true;
      setPhase("done");
      onRevealRef.current();
      onCompleteRef.current();
      return;
    }

    const logo = headerLogoEl();
    if (!logo) {
      onRevealRef.current();
      finish();
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      onRevealRef.current();
      finish();
      return;
    }

    document.body.classList.add("ps-home-intro-active");
    logo.classList.add("ps-header-logo--intro");
    logo.style.willChange = "transform";
    logo.style.transformOrigin = "center center";
    logo.style.filter = "drop-shadow(0 4px 28px rgba(0, 0, 0, 0.55))";

    const rootFs =
      parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const expandedMax = EXPANDED_MAX_REM * rootFs;

    const final = logo.getBoundingClientRect();
    const finalCx = final.left + final.width / 2;
    const finalCy = final.top + final.height / 2;
    const viewCx = window.innerWidth / 2;
    const viewCy = window.innerHeight / 2 - 1.75 * rootFs;
    const scale = Math.min(
      expandedMax / Math.max(final.width, 1),
      expandedMax / Math.max(final.height, 1),
      (window.innerHeight * 0.42) / Math.max(final.height, 1),
    );
    const dx = viewCx - finalCx;
    const dy = viewCy - finalCy;

    logo.style.transition = "none";
    logo.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;

    const holdTimer = window.setTimeout(() => {
      setPhase("collapse");
      void logo.offsetWidth;
      logo.style.transition = `transform ${COLLAPSE_MS}ms cubic-bezier(0.4, 0, 0.2, 1), filter ${COLLAPSE_MS}ms ease`;
      logo.style.transform = "none";
      logo.style.filter = "none";

      const collapseTimer = window.setTimeout(() => {
        reveal();
      }, COLLAPSE_MS);
      timersRef.current.push(collapseTimer);
    }, HOLD_MS);
    timersRef.current.push(holdTimer);

    return () => {
      for (const id of timersRef.current) {
        window.clearTimeout(id);
        window.cancelAnimationFrame(id);
      }
      timersRef.current = [];
      clearLogoInline(logo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot on mount
  }, []);

  if (!mounted || phase === "done") return null;

  return createPortal(
    <div
      className={`ps-home-intro ps-home-intro--${phase}`}
      aria-hidden="true"
    >
      <p className="ps-home-intro-name">{site.name}</p>
    </div>,
    document.body,
  );
}
