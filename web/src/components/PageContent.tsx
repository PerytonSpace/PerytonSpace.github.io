type PageContentProps = {
  html: string;
  as?: "main" | "div";
};

export function PageContent({ html, as = "main" }: PageContentProps) {
  const Tag = as;
  return (
    <Tag
      id={as === "main" ? "wp--skip-link--target" : undefined}
      className={
        as === "main"
          ? "wp-block-group is-layout-flow wp-block-group-is-layout-flow"
          : "entry-content alignfull wp-block-post-content has-global-padding is-layout-constrained wp-block-post-content-is-layout-constrained"
      }
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
