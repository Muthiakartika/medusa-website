/**
 * Renders a JSON-LD graph. The payload is built from our own content modules,
 * never from user input, so serialising it straight into the script tag is
 * safe — we only guard `<` so a stray sequence can't close the tag early.
 */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
