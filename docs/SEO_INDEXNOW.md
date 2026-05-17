# IndexNow setup

Lunary now exposes two pieces for IndexNow:

- public key file: `/indexnow-key.txt`
- submission endpoint: `POST /api/indexnow`

## Required environment

Set these in the deployment environment:

- `INDEXNOW_KEY`
- `INDEXNOW_PUBLISH_SECRET`

Optional:

- `INDEXNOW_KEY_LOCATION`
- `NEXT_PUBLIC_SITE_URL`

If `INDEXNOW_KEY_LOCATION` is omitted, Lunary uses:

`https://lunary.app/indexnow-key.txt`

## Verify the key file

After deploy, open:

`https://lunary.app/indexnow-key.txt`

It should return only the key value as plain text.

## Submit updated URLs

Send a POST request with the shared secret in either:

- `x-indexnow-secret`
- `Authorization: Bearer <secret>`

Example body:

```json
{
  "urls": [
    "https://lunary.app/grimoire/zodiac/aries",
    "https://lunary.app/grimoire/zodiac/aries/in-the-chart",
    "https://lunary.app/grimoire/astronomy/planets/mars/in-signs"
  ]
}
```

This route submits to the IndexNow global endpoint so Bing and other participating engines can pick it up.

## Submit discovery URLs after an SEO deploy

After changing `robots.txt`, `llms.txt`, `ai-citation-map.json`, `.well-known` manifests, or the sitemap index, run a dry run first:

```bash
pnpm seo:indexnow:discovery:dry
```

Then submit the curated discovery set:

```bash
pnpm seo:indexnow:discovery
```

This sends only the homepage, crawl declarations, AI citation map, AI manifests, sitemap index, and curated high-signal sitemap files. It does not touch Neon and does not submit deprioritized scaled families such as birthday, crystals, decans, or broad ritual inventory.

The discovery set also includes the public citation dataset catalog, dataset JSON endpoints, and methodology page:

- `/grimoire/datasets`
- `/grimoire/datasets/core-astrology.json`
- `/grimoire/datasets/current-sky-facts.json`
- `/about/methodology`

## Verify AI search readiness

Run the AI discovery verifier before submitting the branch:

```bash
pnpm seo:verify:ai
```

This checks the public AI/Bing discovery files, GPT action auth declarations, sitemap-index curation, crawler-specific robots allowances, the AI citation map, and the shared Grimoire direct-answer block used for answer-engine extraction.

## AI citation map

`/ai-citation-map.json` is the compact machine-readable map for answer engines. Keep it focused on canonical public surfaces and do not add private API, profile, checkout, auth, or admin URLs.

Public dataset endpoints are allowed citation surfaces when the answer engine needs structured astrology facts. Pair them with canonical Grimoire entity pages or `/about/methodology` for interpretation and calculation context.

## Recommended triggers

Submit when these change materially:

- zodiac sign pillar pages
- zodiac in-the-chart pages
- planet overview pages
- planet in-signs pages
- rulerships and dignities page
- public citation datasets or glossary entity pages
- major horoscope/monthly/yearly pages
- time-sensitive transit or event pages
