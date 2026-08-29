import type { Metadata } from "next";
import { HomeBodyClass } from "@/components/HomeBodyClass";
import { HomeSnap } from "@/components/HomeSnap";
import { getHomePage } from "@/lib/content";

export const metadata: Metadata = {
  title: getHomePage()
    .title.replace(/ — Peryton Space$/, "")
    .replace(/ – Peryton Space$/, ""),
};

export default function HomePage() {
  return (
    <>
      <HomeBodyClass />
      <HomeSnap />
    </>
  );
}
