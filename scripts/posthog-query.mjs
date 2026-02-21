import 'dotenv/config';

const POSTHOG_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const HOST = 'https://eu.posthog.com';

async function queryPostHog() {
  // 1. Get events from yesterday (Feb 19)
  console.log('=== POSTHOG: Events from Feb 19 ===');
  const eventsRes = await fetch(
    `${HOST}/api/projects/${PROJECT_ID}/events?after=2026-02-19T00:00:00Z&before=2026-02-20T00:00:00Z&limit=200`,
    { headers: { Authorization: `Bearer ${POSTHOG_KEY}` } },
  );

  if (eventsRes.ok) {
    const data = await eventsRes.json();
    console.log('Total events returned:', data.results?.length || 0);
    const counts = {};
    const users = new Set();
    (data.results || []).forEach((e) => {
      counts[e.event] = (counts[e.event] || 0) + 1;
      if (e.distinct_id) users.add(e.distinct_id);
    });
    console.log('Event counts:', JSON.stringify(counts, null, 2));
    console.log('Distinct users:', users.size);
  } else {
    console.log(
      'Events API error:',
      eventsRes.status,
      (await eventsRes.text()).substring(0, 300),
    );
  }

  // 2. DAU trend (unique users per day, last 14 days)
  console.log('\n=== POSTHOG: DAU ($pageview unique users) last 14 days ===');
  const trendsRes = await fetch(
    `${HOST}/api/projects/${PROJECT_ID}/insights/trend/`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${POSTHOG_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [{ id: '$pageview', type: 'events', math: 'dau' }],
        date_from: '-14d',
        interval: 'day',
      }),
    },
  );

  if (trendsRes.ok) {
    const data = await trendsRes.json();
    if (data.result && data.result[0]) {
      const r = data.result[0];
      if (r.days && r.data) {
        r.days.forEach((day, i) =>
          console.log(day, '|', r.data[i], 'unique users'),
        );
      }
    } else {
      console.log('No trend data:', JSON.stringify(data).substring(0, 500));
    }
  } else {
    console.log(
      'Trends error:',
      trendsRes.status,
      (await trendsRes.text()).substring(0, 300),
    );
  }

  // 3. Product events DAU
  console.log('\n=== POSTHOG: Product events DAU last 14 days ===');
  const productRes = await fetch(
    `${HOST}/api/projects/${PROJECT_ID}/insights/trend/`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${POSTHOG_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [
          { id: 'tarot_drawn', type: 'events', math: 'dau' },
          { id: 'tarot_viewed', type: 'events', math: 'dau' },
          { id: 'chart_viewed', type: 'events', math: 'dau' },
          { id: 'birth_chart_viewed', type: 'events', math: 'dau' },
          { id: 'horoscope_viewed', type: 'events', math: 'dau' },
          { id: 'astral_chat_used', type: 'events', math: 'dau' },
          { id: 'daily_dashboard_viewed', type: 'events', math: 'dau' },
          { id: 'grimoire_viewed', type: 'events', math: 'dau' },
        ],
        date_from: '-14d',
        interval: 'day',
      }),
    },
  );

  if (productRes.ok) {
    const data = await productRes.json();
    if (data.result) {
      data.result.forEach((series) => {
        const nonZeroDays =
          series.days?.filter((_, i) => series.data[i] > 0) || [];
        if (nonZeroDays.length > 0) {
          console.log(`\n${series.label}:`);
          series.days.forEach((day, i) => {
            if (series.data[i] > 0) console.log(`  ${day} | ${series.data[i]}`);
          });
        }
      });
    }
  } else {
    console.log(
      'Product events error:',
      productRes.status,
      (await productRes.text()).substring(0, 300),
    );
  }

  // 4. Total events volume per day
  console.log('\n=== POSTHOG: Total events per day (last 14 days) ===');
  const volRes = await fetch(
    `${HOST}/api/projects/${PROJECT_ID}/insights/trend/`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${POSTHOG_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [{ id: '$pageview', type: 'events', math: 'total' }],
        date_from: '-14d',
        interval: 'day',
      }),
    },
  );

  if (volRes.ok) {
    const data = await volRes.json();
    if (data.result && data.result[0]) {
      const r = data.result[0];
      r.days?.forEach((day, i) =>
        console.log(day, '|', r.data[i], 'pageviews'),
      );
    }
  } else {
    console.log('Volume error:', volRes.status);
  }
}

queryPostHog().catch((e) => console.error('Error:', e.message));
