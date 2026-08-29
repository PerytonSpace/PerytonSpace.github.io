import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="wp--skip-link--target"
      className="wp-block-group is-layout-flow wp-block-group-is-layout-flow"
      style={{ padding: "4rem 2rem", textAlign: "center" }}
    >
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <p>
        <Link href="/">← Back to home</Link>
      </p>
    </main>
  );
}
