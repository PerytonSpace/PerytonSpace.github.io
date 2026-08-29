"use client";

import { useEffect } from "react";

/** Ensures homepage layout rules apply (scrape.css / globals use body.ps-is-home). */
export function HomeBodyClass() {
  useEffect(() => {
    document.body.classList.add("home", "ps-is-home");
    return () => {
      document.body.classList.remove("home", "ps-is-home");
    };
  }, []);
  return null;
}
