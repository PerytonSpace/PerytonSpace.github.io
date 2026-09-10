"use client";

import { useCallback, useId, useRef, useState } from "react";
import { withBase } from "@/lib/basePath";
import type { GalleryImage } from "@/lib/gallery";

export function ImageCarousel({
  images,
  label = "Photo gallery",
}: {
  images: GalleryImage[];
  label?: string;
}) {
  const id = useId();
  const [index, setIndex] = useState(0);
  const pointer = useRef<{ id: number; x: number } | null>(null);

  const count = images.length;
  const current = images[index];

  const go = useCallback(
    (next: number) => {
      if (!count) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  if (!current) return null;

  return (
    <section
      className="ps-carousel"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(index - 1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          go(index + 1);
        }
      }}
    >
      <div
        className="ps-carousel-stage"
        onPointerDown={(event) => {
          pointer.current = { id: event.pointerId, x: event.clientX };
        }}
        onPointerUp={(event) => {
          const start = pointer.current;
          pointer.current = null;
          if (!start || start.id !== event.pointerId) return;
          const dx = event.clientX - start.x;
          if (dx > 48) go(index - 1);
          if (dx < -48) go(index + 1);
        }}
        onPointerCancel={() => {
          pointer.current = null;
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={withBase(current.src)}
          alt={current.alt}
          loading="lazy"
        />
        {count > 1 ? (
          <>
            <button
              type="button"
              className="ps-carousel-arrow ps-carousel-arrow--prev"
              aria-label="Previous image"
              onClick={() => go(index - 1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="ps-carousel-arrow ps-carousel-arrow--next"
              aria-label="Next image"
              onClick={() => go(index + 1)}
            >
              ›
            </button>
          </>
        ) : null}
      </div>
      <div className="ps-carousel-meta">
        {current.alt ? (
          <p className="ps-carousel-caption">{current.alt}</p>
        ) : (
          <span />
        )}
        <p className="ps-carousel-count" aria-live="polite">
          {index + 1} / {count}
        </p>
      </div>
      {count > 1 ? (
        <div className="ps-carousel-dots" role="tablist" aria-label="Choose image">
          {images.map((image, i) => (
            <button
              key={`${image.src}-${i}`}
              type="button"
              role="tab"
              id={`${id}-dot-${i}`}
              aria-selected={i === index}
              aria-label={image.alt || `Image ${i + 1}`}
              className={
                i === index
                  ? "ps-carousel-dot is-active"
                  : "ps-carousel-dot"
              }
              onClick={() => go(i)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
