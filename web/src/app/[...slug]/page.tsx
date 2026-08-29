import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EthosSection } from "@/components/EthosSection";
import { PageContent } from "@/components/PageContent";
import { StructuredPageView } from "@/components/StructuredPage";
import { getStaticPaths, resolvePage } from "@/lib/content";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export function generateStaticParams() {
  return getStaticPaths();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = resolvePage(slug.join("/"));
  if (!resolved) return {};
  if (resolved.kind === "structured") {
    return { title: resolved.page.title };
  }
  const title = resolved.page.title
    .replace(/ — Peryton Space$/, "")
    .replace(/ – Peryton Space$/, "");
  return { title };
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const path = slug.join("/");
  const resolved = resolvePage(path);
  if (!resolved) notFound();

  if (resolved.kind === "structured") {
    return (
      <>
        <StructuredPageView page={resolved.page} />
        {path === "about" ? <EthosSection /> : null}
      </>
    );
  }

  const page = resolved.page;
  const isPostLayout = !page.content.includes('id="wp--skip-link--target"');

  return (
    <PageContent html={page.content} as={isPostLayout ? "div" : "main"} />
  );
}
