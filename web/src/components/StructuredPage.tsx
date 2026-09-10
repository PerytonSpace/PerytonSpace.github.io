import Link from "next/link";
import { ImageCarousel } from "@/components/ImageCarousel";
import { withBase, withBaseHtml } from "@/lib/basePath";
import { cardCoverClass, cardCoverVars } from "@/lib/cardCover";
import { asGalleryImages } from "@/lib/gallery";
import { yearHref, yearIsNavigable } from "@/lib/missions";
import {
  resolveMissionYears,
  resolvePersonGroups,
  resolvePersonSource,
  resolveSponsorTiers,
  resolveYearListSource,
  type StructuredPage as StructuredPageData,
  type StructuredSection,
  type TeamPerson,
} from "@/lib/structured";

function isAuthoringNote(note?: string): boolean {
  if (!note) return true;
  return /tbd|to be confirmed|before deploy|assumed ok|replace with|pending reply|ask before adding/i.test(
    note,
  );
}

function PersonCard({ person }: { person: TeamPerson }) {
  const publicNote = person.note && !isAuthoringNote(person.note) ? person.note : null;
  return (
    <li className="ps-person-card">
      {person.photo ? (
        <img
          className="ps-person-photo"
          src={withBase(person.photo)}
          alt=""
          width={160}
          height={160}
          loading="lazy"
        />
      ) : (
        <span className="ps-person-photo ps-person-photo--empty" aria-hidden />
      )}
      <h3 className="ps-person-name">{person.name}</h3>
      <p className="ps-person-role">{person.role}</p>
      {publicNote ? <p className="ps-person-note">{publicNote}</p> : null}
      {person.linkedin ? (
        <a
          className="ps-person-link"
          href={person.linkedin}
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
      ) : null}
    </li>
  );
}

function PersonGrid({ people }: { people: TeamPerson[] }) {
  if (!people.length) return null;
  return (
    <ul className="ps-person-grid">
      {people.map((person) => (
        <PersonCard key={`${person.name}-${person.role}`} person={person} />
      ))}
    </ul>
  );
}

function Section({ section }: { section: StructuredSection }) {
  const props = section.props ?? {};

  switch (section.type) {
    case "heading": {
      const level = Number(props.level ?? 2);
      const text = String(props.text ?? "");
      const Tag = (
        level === 1 ? "h1" : level === 3 ? "h3" : "h2"
      ) as "h1" | "h2" | "h3";
      return <Tag className="ps-page-title">{text}</Tag>;
    }
    case "richtext":
      return (
        <div
          className="ps-prose"
          dangerouslySetInnerHTML={{
            __html: withBaseHtml(String(props.html ?? "")),
          }}
        />
      );
    case "image": {
      const src = String(props.src ?? "");
      if (!src) return null;
      return (
        <figure className="ps-figure">
          <img
            src={withBase(src)}
            alt={String(props.alt ?? "")}
            loading="lazy"
          />
        </figure>
      );
    }
    case "gallery": {
      const images = asGalleryImages(props.images);
      if (images.length < 2) {
        const only = images[0];
        if (!only) return null;
        return (
          <figure className="ps-figure">
            <img src={withBase(only.src)} alt={only.alt} loading="lazy" />
          </figure>
        );
      }
      return <ImageCarousel images={images} />;
    }
    case "placeholder":
      return (
        <div className="ps-placeholder">
          <h3 className="ps-placeholder-title">{String(props.title ?? "Coming soon")}</h3>
          {props.body ? (
            <p className="ps-placeholder-body">{String(props.body)}</p>
          ) : null}
        </div>
      );
    case "cta": {
      const href = String(props.href ?? "/");
      const label = String(props.label ?? "Learn more");
      const external = Boolean(props.external);
      if (external) {
        return (
          <p className="ps-cta">
            <a href={href} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          </p>
        );
      }
      return (
        <p className="ps-cta">
          <Link href={href}>{label}</Link>
        </p>
      );
    }
    case "personGrid": {
      return <PersonGrid people={resolvePersonSource(String(props.source ?? ""))} />;
    }
    case "personGroups": {
      const groups = resolvePersonGroups(String(props.source ?? ""));
      if (!groups.length) return null;
      return (
        <div className="ps-person-groups">
          {groups.map((group, i) => (
            <section
              key={group.title ?? `group-${i}`}
              className="ps-person-group"
            >
              {group.title ? (
                <h2 className="ps-section-title">{group.title}</h2>
              ) : null}
              <PersonGrid people={group.members} />
            </section>
          ))}
        </div>
      );
    }
    case "yearList": {
      const years = resolveYearListSource(String(props.source ?? ""));
      return (
        <ul className="ps-year-list">
          {years.map((y) => (
            <li key={y.year}>
              <Link href={y.href}>{y.label}</Link>
              {y.current ? (
                <span className="ps-year-current">Current</span>
              ) : null}
            </li>
          ))}
        </ul>
      );
    }
    case "missionYears": {
      const resolved = resolveMissionYears(String(props.missionId ?? ""));
      if (!resolved) return null;
      const { mission, years } = resolved;
      return (
        <ul className="ps-mission-years">
          {years.map((year) => {
            const navigable = yearIsNavigable(year);
            const cover = year.coverImage ?? mission.coverImage;
            const coverClass = cardCoverClass(cover);
            const coverStyle = cardCoverVars(cover);
            return (
              <li key={year.id} className="ps-mission-year">
                {navigable ? (
                  <Link
                    className={`ps-mission-year-link ${coverClass}`.trim()}
                    href={yearHref(mission, year)}
                    style={coverStyle}
                  >
                    <span className="ps-mission-year-label">{year.label}</span>
                    {year.awards.length ? (
                      <span className="ps-mission-year-awards">
                        {year.awards.join(" · ")}
                      </span>
                    ) : null}
                    <span className="ps-mission-year-summary">{year.summary}</span>
                  </Link>
                ) : (
                  <span
                    className={`ps-mission-year-link ps-nav-link--soon ${coverClass}`.trim()}
                    title="Coming soon"
                    style={coverStyle}
                  >
                    <span className="ps-mission-year-label">{year.label}</span>
                    <span className="ps-mission-year-summary ps-mission-year-summary--status">
                      Coming soon
                    </span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      );
    }
    case "tierList": {
      const tiers = resolveSponsorTiers();
      if (!tiers) {
        return (
          <p className="ps-muted">
            No public partnerships or sponsors listed right now.
          </p>
        );
      }
      return (
        <div className="ps-tiers">
          {tiers.map((tier) => (
            <section key={tier.id} className="ps-tier">
              <h2 className="ps-tier-title">{tier.title}</h2>
              <ul className="ps-sponsor-grid">
                {tier.entries.map((e) => (
                  <li key={e.name} className="ps-sponsor-card">
                    {e.logo ? (
                      <img
                        className="ps-sponsor-logo"
                        src={withBase(e.logo)}
                        alt=""
                      />
                    ) : null}
                    <strong>{e.name}</strong>
                    {e.blurb ? <span>{e.blurb}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      );
    }
    case "embedForm": {
      const url = String(props.formEmbedUrl ?? "").trim();
      if (url) {
        return (
          <div className="ps-form-embed">
            <iframe
              title="Contact form"
              src={url}
              width="100%"
              height={980}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            >
              Loading…
            </iframe>
          </div>
        );
      }
      return (
        <div className="ps-form-fallback">
          <p
            dangerouslySetInnerHTML={{
              __html: String(
                props.fallbackNote ??
                  "Contact form embed URL not configured yet.",
              ),
            }}
          />
        </div>
      );
    }
    default:
      return null;
  }
}

export function StructuredPageView({ page }: { page: StructuredPageData }) {
  return (
    <main className="ps-structured" id="wp--skip-link--target">
      <div className="ps-structured-inner">
        {page.sections.map((section, i) => (
          <Section key={section.id ?? `${section.type}-${i}`} section={section} />
        ))}
      </div>
    </main>
  );
}
