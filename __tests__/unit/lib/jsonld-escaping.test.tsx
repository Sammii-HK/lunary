import { renderJsonLd } from '@/lib/schema';

/**
 * Security regression: JSON-LD blocks must escape `<` so user-supplied text
 * (e.g. community Q&A) cannot break out of the <script type="application/ld+json">
 * tag with a `</script>` payload. The community questions page renders
 * user-controlled question/answer text through renderJsonLd.
 */
describe('renderJsonLd XSS escaping', () => {
  function htmlOf(node: ReturnType<typeof renderJsonLd>): string {
    // renderJsonLd returns a <script dangerouslySetInnerHTML={{ __html }} /> element.
    const props = (
      node as { props?: { dangerouslySetInnerHTML?: { __html?: string } } }
    )?.props;
    return props?.dangerouslySetInnerHTML?.__html ?? '';
  }

  it('escapes a </script> breakout payload in user-controlled fields', () => {
    const malicious = '</script><script>alert(document.cookie)</script>';
    const html = htmlOf(
      renderJsonLd({
        '@context': 'https://schema.org',
        '@type': 'QAPage',
        name: malicious,
        text: malicious,
      }),
    );

    // No literal '<' may survive, so the HTML parser can never see a real
    // </script> or <script> tag — every '<' is escaped to the \u003c sequence.
    expect(html).not.toContain('<');
    expect(html).toContain('\\u003c/script>');
    // Still valid JSON once the unicode escapes are interpreted by a JSON parser,
    // and the original payload round-trips faithfully as data (not markup).
    expect(() => JSON.parse(html)).not.toThrow();
    expect(JSON.parse(html).name).toBe(malicious);
  });

  it('returns null for empty schema', () => {
    expect(renderJsonLd(null)).toBeNull();
  });
});
