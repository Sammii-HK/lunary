const Stripe = require('stripe');
const fs = require('fs');

const envContent = fs.readFileSync(
  '/Users/sammii/development/lunary/.env.local',
  'utf8',
);
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([A-Z_]+[A-Z0-9_]*)=["']?(.+?)["']?\s*$/);
  if (match) envVars[match[1]] = match[2];
}

const stripe = new Stripe(envVars.STRIPE_SECRET_KEY);

const NOTION_URLS = {
  'tarot-journal':
    'https://sable-spell-fc7.notion.site/Tarot-Journal-3242995425f9816da1c4fb78de642fa7',
  'moon-planner-2026':
    'https://sable-spell-fc7.notion.site/Moon-Planner-2026-3242995425f981c8b4a8c685f1856346',
  'rune-journal':
    'https://sable-spell-fc7.notion.site/Rune-Journal-32a2995425f9814fb2eef97f3356a3d2',
  'angel-numbers-journal':
    'https://sable-spell-fc7.notion.site/Angel-Numbers-Journal-32a2995425f981d79f05c16833060bb9',
  'digital-grimoire':
    'https://sable-spell-fc7.notion.site/Digital-Grimoire-3242995425f981ecb825fc5580f9ce0d',
  'shadow-work-journal':
    'https://sable-spell-fc7.notion.site/Shadow-Work-Journal-32b2995425f98188abfdf606cf772ead',
  'dream-journal':
    'https://sable-spell-fc7.notion.site/Dream-Journal-32b2995425f9818cbaaaf94c50ce5656',
  'oracle-card-journal':
    'https://sable-spell-fc7.notion.site/Oracle-Card-Journal-32b2995425f981c39a10fcb1bf00257d',
  'chakra-healing-tracker':
    'https://sable-spell-fc7.notion.site/Chakra-Healing-Tracker-32b2995425f9816790d8f3ec90e47ca0',
  'crystal-collection-manager':
    'https://sable-spell-fc7.notion.site/Crystal-Collection-Manager-32b2995425f9812b9b27e0149d7ef712',
  'wheel-of-the-year-planner':
    'https://sable-spell-fc7.notion.site/Wheel-of-the-Year-Planner-32b2995425f9812da544e5eff216e39a',
  'astrology-birth-chart-journal':
    'https://sable-spell-fc7.notion.site/Astrology-Birth-Chart-Journal-32b2995425f981bbb94bdab45c08f05f',
  'manifestation-journal':
    'https://sable-spell-fc7.notion.site/Manifestation-Journal-32b2995425f981e6a9a3fd1ccd45fddc',
};

const TEMPLATE_DETAILS = {
  'tarot-journal': {
    name: 'Tarot Journal',
    desc: 'Complete Notion tarot practice system with 78 card references, 6 spread guides, and daily draw tracker.',
    price: 1200,
  },
  'moon-planner-2026': {
    name: 'Moon Planner 2026',
    desc: 'Full lunar year planner with all 2026 moon dates, phases, and signs pre-filled.',
    price: 1000,
  },
  'rune-journal': {
    name: 'Rune Journal',
    desc: 'All 24 Elder Futhark runes with meanings, daily draw log, and reading tracker.',
    price: 1000,
  },
  'angel-numbers-journal': {
    name: 'Angel Numbers Journal',
    desc: 'Complete angel number reference with 111 to 999 meanings, sign tracker, and personal message log.',
    price: 900,
  },
  'digital-grimoire': {
    name: 'Digital Grimoire',
    desc: 'Comprehensive digital spell book with 35 spells, ritual supplies tracker, and moon phase rituals.',
    price: 1200,
  },
};

async function run() {
  const existing = await stripe.products.list({ limit: 100, active: true });
  const notionProducts = existing.data.filter(
    (p) => p.metadata && p.metadata.category === 'notion_template',
  );

  console.log(
    `\nUpdating ${notionProducts.length} existing notion template products...`,
  );
  for (const prod of notionProducts) {
    const packId = prod.metadata.packId;
    const url = NOTION_URLS[packId];
    if (!url) {
      console.log(`  ⚠️  No URL for ${packId}`);
      continue;
    }
    const meta = Object.assign({}, prod.metadata, { blobUrl: url });
    await stripe.products.update(prod.id, { metadata: meta });
    console.log(`  ✅ ${prod.name} updated with notion URL`);
  }

  const existingPackIds = new Set(notionProducts.map((p) => p.metadata.packId));
  const missing = Object.entries(TEMPLATE_DETAILS).filter(
    ([id]) => !existingPackIds.has(id),
  );

  console.log(
    `\nCreating ${missing.length} missing notion template products...`,
  );
  for (const [packId, details] of missing) {
    const notionUrl = NOTION_URLS[packId];
    const product = await stripe.products.create({
      name: details.name,
      description: details.desc,
      metadata: {
        packId,
        category: 'notion_template',
        blobUrl: notionUrl,
        format: 'Notion Template',
      },
    });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: details.price,
      currency: 'gbp',
      metadata: { packId, category: 'notion_template' },
    });
    await stripe.products.update(product.id, { default_price: price.id });
    console.log(
      `  ✅ Created ${details.name} (${product.id}) @ £${details.price / 100} — priceId: ${price.id}`,
    );
  }

  console.log('\nAll done!');
}

run().catch(console.error);
