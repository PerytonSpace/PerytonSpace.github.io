"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { NavIcon } from "@/components/NavIcons";
import { requestHomeTop } from "@/lib/home";
import {
  getNavigation,
  isYearNavChildren,
  site,
  type NavLink,
} from "@/lib/site";

function isComingSoon(item: { status?: string }): boolean {
  return item.status === "comingSoon";
}

function normalizePath(path: string): string {
  const bare = path.split("#")[0] ?? path;
  if (!bare || bare === "/") return "/";
  return bare.replace(/\/+$/, "") || "/";
}

function hrefMatches(href: string, path: string): boolean {
  const a = normalizePath(href);
  const b = normalizePath(path);
  if (a === "/") return b === "/";
  return b === a || b.startsWith(`${a}/`);
}

function itemIsActive(item: NavLink, path: string): boolean {
  if (item.href && hrefMatches(item.href, path)) return true;
  return item.children?.some((child) => itemIsActive(child, path)) ?? false;
}

/** First live landing for a section (group → first live child). */
function sectionHref(item: NavLink): string | undefined {
  if (item.href && !isComingSoon(item)) return item.href;
  const first = item.children?.find(
    (child) => child.href && !isComingSoon(child),
  );
  return first?.href;
}

function canHoverFine(): boolean {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function NavLeaf({
  item,
  onNavigate,
  className = "ps-nav-link",
}: {
  item: NavLink;
  onNavigate?: () => void;
  className?: string;
}) {
  const soon = isComingSoon(item);

  if (soon || !item.href) {
    return (
      <span
        className={`${className} ps-nav-link--soon`}
        aria-disabled="true"
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
    <Link className={className} href={item.href} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}

/** Competition with year children — years appear on hover / focus, not inline. */
function NavYearHover({
  item,
  onNavigate,
}: {
  item: NavLink;
  onNavigate?: () => void;
}) {
  const years = item.children ?? [];
  const parentSoon = isComingSoon(item);

  return (
    <li className="ps-nav-item ps-nav-item--years">
      <div className="ps-nav-years">
        {parentSoon || !item.href ? (
          <span className="ps-nav-link ps-nav-years-label">{item.label}</span>
        ) : (
          <Link
            className="ps-nav-link ps-nav-years-label"
            href={item.href}
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        )}
        <ul className="ps-nav-years-flyout" aria-label={`${item.label} years`}>
          {years.map((year) => (
            <li key={`${item.label}-${year.label}`}>
              <NavLeaf
                item={year}
                onNavigate={onNavigate}
                className="ps-nav-link ps-nav-years-link"
              />
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function NavBranch({
  item,
  onNavigate,
  depth = 0,
}: {
  item: NavLink;
  onNavigate?: () => void;
  depth?: number;
}) {
  if (!item.children?.length) {
    return (
      <li className="ps-nav-item">
        <NavLeaf item={item} onNavigate={onNavigate} />
      </li>
    );
  }

  if (isYearNavChildren(item)) {
    return <NavYearHover item={item} onNavigate={onNavigate} />;
  }

  const parentSoon = isComingSoon(item);

  return (
    <li className={`ps-nav-item ps-nav-item--branch depth-${depth}`}>
      {parentSoon || !item.href ? (
        <span className="ps-nav-group-label">{item.label}</span>
      ) : (
        <Link
          className="ps-nav-group-label ps-nav-group-label--link"
          href={item.href}
          onClick={onNavigate}
        >
          {item.label}
        </Link>
      )}
      <ul className="ps-nav-sub">
        {item.children.map((child) => (
          <NavBranch
            key={`${child.label}-${child.href ?? "soon"}`}
            item={child}
            onNavigate={onNavigate}
            depth={depth + 1}
          />
        ))}
      </ul>
    </li>
  );
}

function RailIcon({
  item,
  pathname,
}: {
  item: NavLink;
  pathname: string;
}) {
  const href = sectionHref(item);
  const active = itemIsActive(item, pathname);
  const className = `ps-nav-icon${active ? " is-active" : ""}`;

  return (
    <li>
      <span className={className} aria-hidden>
        <NavIcon label={item.label} />
        <span className="ps-nav-icon-tip">{item.label}</span>
      </span>
    </li>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const nav = getNavigation();
  const pathname = usePathname() ?? "/";
  const leaveTimer = useRef<number | null>(null);

  useEffect(() => {
    document.body.classList.toggle("ps-nav-expanded", open);
    document.body.classList.toggle("ps-nav-open", open);
    return () => {
      document.body.classList.remove("ps-nav-expanded", "ps-nav-open");
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    return () => {
      if (leaveTimer.current != null) window.clearTimeout(leaveTimer.current);
    };
  }, []);

  const expand = () => {
    if (leaveTimer.current != null) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    setOpen(true);
  };

  const collapse = () => {
    if (leaveTimer.current != null) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    setOpen(false);
  };

  const collapseSoon = () => {
    if (leaveTimer.current != null) window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => {
      leaveTimer.current = null;
      setOpen(false);
    }, 120);
  };

  const goToHomeHero = (e: MouseEvent<HTMLAnchorElement>) => {
    if (normalizePath(pathname) === "/") {
      e.preventDefault();
      requestHomeTop();
    }
    collapse();
  };

  const onNavEnter = () => {
    if (canHoverFine()) expand();
  };

  const onNavLeave = () => {
    if (canHoverFine()) collapseSoon();
  };

  const onNavClick = (e: MouseEvent<HTMLElement>) => {
    if (open) return;
    if ((e.target as HTMLElement).closest(".ps-nav-logo")) return;
    e.preventDefault();
    expand();
  };

  return (
    <>
      <button
        type="button"
        className={`ps-nav-backdrop${open ? " is-open" : ""}`}
        aria-label="Collapse menu"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        inert={!open ? true : undefined}
        onClick={collapse}
      />
      <nav
        id={panelId}
        className={`ps-nav-panel${open ? " is-open" : ""}`}
        aria-label={open ? "Main navigation" : "Open main navigation"}
        aria-expanded={open}
        tabIndex={open ? undefined : 0}
        onMouseEnter={onNavEnter}
        onMouseLeave={onNavLeave}
        onFocus={(e) => {
          if ((e.target as HTMLElement).closest(".ps-nav-logo")) return;
          expand();
        }}
        onClick={onNavClick}
      >
        <div className="ps-nav-panel-inner">
          <Link
            href="/"
            className="ps-nav-logo"
            rel="home"
            aria-label={`${site.name} — Home`}
            onClick={goToHomeHero}
          >
            <Image
              id="ps-header-logo"
              src={site.logo}
              alt=""
              width={56}
              height={66}
              className="ps-logo"
              priority
            />
            <span className="ps-nav-logo-name">{site.name}</span>
          </Link>

          <ul
            className="ps-nav-icons"
            hidden={open}
            inert={open ? true : undefined}
          >
            {nav.map((item) => (
              <RailIcon key={item.label} item={item} pathname={pathname} />
            ))}
          </ul>
          <ul
            className="ps-nav-list"
            hidden={!open}
            inert={!open ? true : undefined}
          >
            {nav.map((item) => (
              <NavBranch
                key={item.label}
                item={item}
                onNavigate={collapse}
              />
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
