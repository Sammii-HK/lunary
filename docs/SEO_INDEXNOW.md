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

## Recommended triggers

Submit when these change materially:

- zodiac sign pillar pages
- zodiac in-the-chart pages
- planet overview pages
- planet in-signs pages
- rulerships and dignities page
- major horoscope/monthly/yearly pages
- time-sensitive transit or event pages
