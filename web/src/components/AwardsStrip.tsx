import Link from "next/link";
import awards from "../../content/site/awards.json";

type AwardItem = {
  id: string;
  competition: string;
  result: string;
  year: string;
  href?: string;
  note?: string;
};

export function AwardsStrip() {
  const items = awards.items as AwardItem[];
  if (!items.length) return null;

  return (
    <section className="ps-awards" aria-labelledby="ps-awards-heading">
      <div className="ps-awards-inner">
        <h2 id="ps-awards-heading" className="ps-awards-title">
          {awards.title}
        </h2>
        <ul className="ps-awards-grid">
          {items.map((item) => {
            const body = (
              <>
                <span className="ps-awards-result">{item.result}</span>
                <span className="ps-awards-comp">{item.competition}</span>
                <span className="ps-awards-year">{item.year}</span>
                {item.note ? (
                  <span className="ps-awards-note">{item.note}</span>
                ) : null}
              </>
            );
            return (
              <li key={item.id} className="ps-awards-item">
                {item.href ? (
                  <Link className="ps-awards-card" href={item.href}>
                    {body}
                  </Link>
                ) : (
                  <div className="ps-awards-card">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
