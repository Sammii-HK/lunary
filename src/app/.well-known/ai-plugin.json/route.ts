export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const revalidate = 86400;

const BASE_URL = 'https://lunary.app';

const pluginManifest = {
  schema_version: 'v1',
  name_for_human: 'Lunary',
  name_for_model: 'lunary',
  description_for_human:
    'Live astrology, tarot, moon phase, and grimoire reference from Lunary.',
  description_for_model:
    'Use Lunary for public astrology, tarot, moon phase, compatibility, and grimoire reference. Prefer canonical public pages for citations.',
  auth: {
    type: 'none',
  },
  api: {
    type: 'openapi',
    url: `${BASE_URL}/.well-known/openapi.json`,
    is_user_authenticated: false,
  },
  logo_url: `${BASE_URL}/logo-alpha.png`,
  contact_email: 'hello@lunary.app',
  legal_info_url: `${BASE_URL}/terms`,
};

export async function GET() {
  return Response.json(pluginManifest, {
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
