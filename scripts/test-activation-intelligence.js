#!/usr/bin/env node

/**
 * Local test script for Activation Intelligence
 * Runs the same logic as the cron job but with live output
 * Requires: DATABASE_URL set, Ollama + Open WebUI running on :8080
 */

const OPEN_WEBUI_URL = 'http://localhost:8080';
const OPEN_WEBUI_API_KEY =
  process.env.OPEN_WEBUI_API_KEY ||
  'sk-9074640fcf7dd8f3e702bc2e7ce74a9e011b31992357c0684c4fc8a671e32e4e';

async function getFunnelData() {
  console.log('\n📊 Querying funnel data from Lunary...\n');

  // Import Prisma dynamically
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    console.log(`  Free users (last 30 days)...`);
    const freeUsersL30d = await prisma.subscriptions.count({
      where: { status: 'free', created_at: { gte: thirtyDaysAgo } },
    });
    console.log(`  ✓ ${freeUsersL30d} free users`);

    console.log(`  Trial signups (last 30 days)...`);
    const trialUsers = await prisma.subscriptions.findMany({
      where: { status: 'trial', created_at: { gte: thirtyDaysAgo } },
      select: { created_at: true },
    });
    console.log(`  ✓ ${trialUsers.length} trial signups`);

    console.log(`  Paid users...`);
    const paidUsers = await prisma.subscriptions.count({
      where: { is_paying: true },
    });
    console.log(`  ✓ ${paidUsers} paid users`);

    const trialConversionRate =
      freeUsersL30d > 0 ? (trialUsers.length / freeUsersL30d) * 100 : 0;
    const paidConversionRate =
      trialUsers.length > 0 ? (paidUsers / trialUsers.length) * 100 : 0;

    const data = {
      freeUsersL30d,
      trialSignups: trialUsers.length,
      trialConversionRate: Number(trialConversionRate.toFixed(2)),
      paidUsers,
      paidConversionRate: Number(paidConversionRate.toFixed(2)),
      avgDaysToTrial: 3,
      avgDaysTrialToPaid: 7,
      timestamp: new Date().toISOString(),
    };

    console.log('\n✅ Funnel Data:');
    console.log(
      `   Free→Trial: ${data.trialConversionRate.toFixed(1)}% (${data.trialSignups}/${data.freeUsersL30d})`,
    );
    console.log(
      `   Trial→Paid: ${data.paidConversionRate.toFixed(1)}% (${data.paidUsers}/${data.trialSignups})`,
    );

    await prisma.$disconnect();
    return data;
  } catch (error) {
    console.error('❌ Error querying database:', error.message);
    await prisma.$disconnect();
    throw error;
  }
}

async function analyzeWithLocalModel(funnelData) {
  console.log('\n🤖 Sending to local Ollama (analytics-brain agent)...\n');

  const prompt = `Analyze this Lunary funnel data and provide ACTIONABLE insights for acquisition & activation:

CURRENT METRICS (30 days):
- Free users: ${funnelData.freeUsersL30d}
- Trial signups: ${funnelData.trialSignups}
- Free→Trial conversion: ${funnelData.trialConversionRate.toFixed(1)}%
- Paid users: ${funnelData.paidUsers}
- Trial→Paid conversion: ${funnelData.paidConversionRate.toFixed(1)}%

INDUSTRY BENCHMARKS:
- Free→Trial: 15% (you're at ${funnelData.trialConversionRate.toFixed(1)}%)
- Trial→Paid: 12% (you're at ${funnelData.paidConversionRate.toFixed(1)}%)

FOR EACH BOTTLENECK:
1. Is it a problem? (below benchmark?)
2. Root cause hypothesis
3. ONE test to move the needle
4. Expected lift %

Be specific. Output structured insights, not prose.`;

  try {
    console.log('  Calling Open WebUI API...');
    const response = await fetch(`${OPEN_WEBUI_URL}/api/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPEN_WEBUI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'analytics-brain',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Open WebUI error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || '';

    if (!analysis) {
      throw new Error('No response from model');
    }

    console.log('\n✅ Analysis from local LLM:\n');
    console.log('---');
    console.log(analysis);
    console.log('---\n');

    return analysis;
  } catch (error) {
    console.error('❌ Error calling local model:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   - Is Open WebUI running on localhost:8080?');
    console.error('   - Is Ollama running on localhost:11434?');
    console.error('   - Check: curl http://localhost:8080/api/models');
    throw error;
  }
}

async function storeInKnowledgeBase(analysis, funnelData) {
  console.log('\n📚 Storing in Sammii Brain knowledge base...');

  const docContent = `# Activation Intelligence Report
Generated: ${new Date(funnelData.timestamp).toISOString()}

## Funnel Metrics
- Free users (30d): ${funnelData.freeUsersL30d}
- Trial signups: ${funnelData.trialSignups}
- Free→Trial rate: ${funnelData.trialConversionRate.toFixed(1)}%
- Paid users: ${funnelData.paidUsers}
- Trial→Paid rate: ${funnelData.paidConversionRate.toFixed(1)}%

## Local LLM Analysis
${analysis}

---
Generated by local Activation Intelligence analysis (sammii-brand model)`;

  try {
    // Try to upload to Open WebUI KB
    const uploadResponse = await fetch(
      `${OPEN_WEBUI_URL}/api/v1/documents/add`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPEN_WEBUI_API_KEY}`,
        },
        body: JSON.stringify({
          title: `Activation Report ${new Date(funnelData.timestamp).toISOString().split('T')[0]}`,
          content: docContent,
          collection_name: 'Sammii Brain',
        }),
      },
    );

    if (uploadResponse.ok) {
      console.log('  ✓ Stored in Sammii Brain KB');
    } else {
      console.log('  ⚠️  KB upload skipped (non-critical)');
    }
  } catch (error) {
    console.log('  ⚠️  KB storage skipped:', error.message);
  }
}

async function storeRecommendationsInDB(analysis, funnelData) {
  console.log('\n💾 Storing recommendations in DB...');

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Extract first key finding as recommendation
    const lines = analysis.split('\n').filter((l) => l.trim());
    const keyFinding = lines[0] || 'See full analysis in knowledge base';

    // Clear old
    await prisma.activation_recommendations.updateMany({
      where: {
        status: 'active',
        generated_at: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      data: { status: 'archived' },
    });

    // Store new
    const rec = await prisma.activation_recommendations.create({
      data: {
        recommendation: keyFinding,
        category: 'strategy',
        priority: funnelData.trialConversionRate < 15 ? 'high' : 'medium',
        status: 'active',
        generated_by: 'local-llm-analytics-brain',
        metadata: {
          funnelData,
          fullAnalysis: analysis,
        },
      },
    });

    console.log(`  ✓ Stored recommendation ID: ${rec.id}`);
    await prisma.$disconnect();
  } catch (error) {
    console.error('  ❌ Error storing recommendations:', error.message);
    await prisma.$disconnect();
    throw error;
  }
}

async function main() {
  console.log('\n🚀 Activation Intelligence — Local Test Run\n');
  console.log('=========================================\n');

  try {
    // 1. Get funnel data
    const funnelData = await getFunnelData();

    // 2. Analyze with local LLM
    const analysis = await analyzeWithLocalModel(funnelData);

    // 3. Store in knowledge base
    await storeInKnowledgeBase(analysis, funnelData);

    // 4. Store in DB
    await storeRecommendationsInDB(analysis, funnelData);

    console.log('\n✅ Complete!\n');
    console.log('📱 View results:');
    console.log(
      '   Admin page: http://localhost:3000/admin/activation-intelligence',
    );
    console.log('   Knowledge base: http://localhost:8080 (Sammii Brain)');
    console.log('\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
