"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import {
  getNavigation,
  headerPrototype,
  isYearNavChildren,
  site,
  type NavLink,
} from "@/lib/site";

function isComingSoon(item: { status?: string }): boolean {
  return item.status === "comingSoon";
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
        title="Coming soon"
        aria-disabled="true"
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

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <span className={`ps-burger-icon${open ? " is-open" : ""}`} aria-hidden>
      <span />
      <span />
      <span />
    </span>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelId = useId();
  const nav = getNavigation();
  const prototype = headerPrototype;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("ps-nav-open", open);
    return () => document.body.classList.remove("ps-nav-open");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const close = () => setOpen(false);

  const drawer =
    mounted &&
    createPortal(
      <>
        <button
          type="button"
          className={`ps-nav-backdrop${open ? " is-open" : ""}`}
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
          onClick={close}
        />
        <nav
          id={panelId}
          className={`ps-nav-panel${open ? " is-open" : ""}`}
          aria-label="Main navigation"
          aria-hidden={!open}
          inert={!open ? true : undefined}
        >
          <div className="ps-nav-panel-inner">
            <ul className="ps-nav-list">
              <li className="ps-nav-item">
                <Link
                  className="ps-nav-link ps-nav-link--home"
                  href="/"
                  aria-label={`${site.name} — Home`}
                  onClick={close}
                >
                  <Image
                    src={site.logo}
                    alt=""
                    width={40}
                    height={47}
                    className="ps-nav-home-logo"
                  />
                  <span>{site.name}</span>
                </Link>
              </li>
              {nav.map((item) => (
                <NavBranch
                  key={item.label}
                  item={item}
                  onNavigate={close}
                />
              ))}
            </ul>
          </div>
        </nav>
      </>,
      document.body,
    );

  return (
    <>
      <header
        className={`ps-header ps-header--${prototype}`}
        data-prototype={prototype}
      >
        <div className="ps-header-bar">
          <button
            type="button"
            className="ps-burger"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <BurgerIcon open={open} />
          </button>

          <Link
            href="/"
            className="ps-home-link"
            rel="home"
            aria-label={`${site.name} — Home`}
            onClick={close}
          >
            <Image
              id="ps-header-logo"
              src={site.logo}
              alt=""
              width={prototype === "rail" ? 48 : 56}
              height={prototype === "rail" ? 56 : 66}
              className="ps-logo"
              priority
            />
          </Link>

          {prototype === "rail" ? (
            <p className="ps-header-tagline" aria-hidden="true">
              {site.tagline}
            </p>
          ) : (
            <span className="ps-header-spacer" aria-hidden="true" />
          )}
        </div>
      </header>
      {drawer}
    </>
  );
}
