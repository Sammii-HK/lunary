#!/usr/bin/env tsx
/**
 * Automated Moon Pack Generation Script
 *
 * This script automatically generates moon phase packs for:
 * - Monthly packs (2-3 months in advance)
 * - Quarterly packs (1 quarter in advance)
 * - Yearly packs (6 months before year starts)
 *
 * Usage:
 *   npx tsx scripts/generate-moon-packs.ts [--dry-run] [--type=monthly|quarterly|yearly|all]
 */

import { config } from 'dotenv';
import Stripe from 'stripe';

// Load environment variables
config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is not set');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

interface PackConfig {
  name: string;
  description: string;
  category: 'moon_phases';
  subcategory: string;
  price: number; // in cents
  year: number;
  month?: number;
  quarter?: number;
  dateRange: string;
}

class MoonPackGenerator {
  private dryRun: boolean;

  constructor(dryRun = false) {
    this.dryRun = dryRun;
  }

  async generatePacks(
    type: 'monthly' | 'quarterly' | 'yearly' | 'all' = 'all',
  ) {
    console.log(
      `🌙 Starting moon pack generation (${type})${this.dryRun ? ' [DRY RUN]' : ''}`,
    );

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentQuarter = Math.floor((currentMonth - 1) / 3) + 1;

    try {
      if (type === 'monthly' || type === 'all') {
        await this.generateMonthlyPacks(currentYear, currentMonth);
      }

      if (type === 'quarterly' || type === 'all') {
        await this.generateQuarterlyPacks(currentYear, currentQuarter);
      }

      if (type === 'yearly' || type === 'all') {
        await this.generateYearlyPacks(currentYear);
      }

      console.log('✅ Moon pack generation completed successfully!');
    } catch (error) {
      console.error('❌ Moon pack generation failed:', error);
      process.exit(1);
    }
  }

  private async generateMonthlyPacks(
    currentYear: number,
    currentMonth: number,
  ) {
    console.log('📅 Generating monthly packs...');

    // Generate packs for next 2-3 months (only if they don't exist)
    const monthsToGenerate = 3;

    for (let i = 1; i <= monthsToGenerate; i++) {
      let targetMonth = currentMonth + i;
      let targetYear = currentYear;

      // Handle year rollover
      if (targetMonth > 12) {
        targetMonth -= 12;
        targetYear += 1;
      }

      const monthName = new Date(
        targetYear,
        targetMonth - 1,
        1,
      ).toLocaleDateString('en-US', { month: 'long' });

      const packConfig: PackConfig = {
        name: `Moon Phases - ${monthName} ${targetYear}`,
        description: `Complete guide to all moon phases in ${monthName} ${targetYear}, with detailed insights, lunar calendar, and spiritual guidance for each phase.`,
        category: 'moon_phases',
        subcategory: `${targetYear}-${targetMonth.toString().padStart(2, '0')}`,
        price: 249, // $2.49 (from pricing-strategy.csv: "Monthly Moon Phases Pack")
        year: targetYear,
        month: targetMonth,
        dateRange: `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01 to ${targetYear}-${targetMonth.toString().padStart(2, '0')}-${new Date(targetYear, targetMonth, 0).getDate()}`,
      };

      await this.createPack(packConfig);
    }
  }

  private async generateQuarterlyPacks(
    currentYear: number,
    currentQuarter: number,
  ) {
    console.log('📊 Generating quarterly packs...');

    // Generate pack for next quarter (only if it doesn't exist)
    let targetQuarter = currentQuarter + 1;
    let targetYear = currentYear;

    // Handle year rollover
    if (targetQuarter > 4) {
      targetQuarter = 1;
      targetYear += 1;
    }

    const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4'];
    const quarterMonths = [
      ['January', 'February', 'March'],
      ['April', 'May', 'June'],
      ['July', 'August', 'September'],
      ['October', 'November', 'December'],
    ];

    const startMonth = (targetQuarter - 1) * 3 + 1;
    const endMonth = targetQuarter * 3;

    const packConfig: PackConfig = {
      name: `Moon Phases - ${quarterNames[targetQuarter - 1]} ${targetYear}`,
      description: `Comprehensive moon phase guide for ${quarterMonths[targetQuarter - 1].join(', ')} ${targetYear}. Includes all lunar cycles, seasonal energies, and spiritual practices for the quarter.`,
      category: 'moon_phases',
      subcategory: `${targetYear}-Q${targetQuarter}`,
      price: 499, // $4.99 (bundle pricing from strategy)
      year: targetYear,
      quarter: targetQuarter,
      dateRange: `${targetYear}-${startMonth.toString().padStart(2, '0')}-01 to ${targetYear}-${endMonth.toString().padStart(2, '0')}-${new Date(targetYear, endMonth, 0).getDate()}`,
    };

    await this.createPack(packConfig);
  }

  private async generateYearlyPacks(currentYear: number) {
    console.log('🗓️ Generating yearly packs...');

    const now = new Date();
    const currentMonth = now.getMonth() + 1;

    // Generate pack for next year if we're in July or later
    if (currentMonth >= 7) {
      const targetYear = currentYear + 1;

      const packConfig: PackConfig = {
        name: `Moon Phases - Complete ${targetYear} Guide`,
        description: `The ultimate moon phase companion for ${targetYear}. Includes all 13 lunar cycles, seasonal transitions, eclipses, and a complete lunar calendar with spiritual guidance for the entire year.`,
        category: 'moon_phases',
        subcategory: `${targetYear}`,
        price: 1999, // $19.99 (yearly discount: 12 months at $2.49 = $29.88, discounted to $19.99)
        year: targetYear,
        dateRange: `${targetYear}-01-01 to ${targetYear}-12-31`,
      };

      await this.createPack(packConfig);
    } else {
      console.log(
        `⏰ Skipping yearly pack generation - too early in year (current month: ${currentMonth})`,
      );
    }
  }

  private async createPack(config: PackConfig) {
    const packId = `pack_${config.category}_${config.subcategory}_${Date.now()}`;

    console.log(
      `\n🎯 ${this.dryRun ? '[DRY RUN] ' : ''}Creating: ${config.name}`,
    );
    console.log(`   Price: $${(config.price / 100).toFixed(2)}`);
    console.log(`   Date Range: ${config.dateRange}`);

    if (this.dryRun) {
      console.log('   ✅ [DRY RUN] Pack would be created');
      return;
    }

    try {
      // Check if pack already exists
      if (await this.packExists(config)) {
        console.log('   ⚠️ Pack already exists, skipping');
        return;
      }

      // Step 1: Generate pack and upload to Blob
      const generateResponse = await fetch(
        `${BASE_URL}/api/shop/packs/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: config.category,
            subcategory: config.subcategory,
            name: config.name,
            description: config.description,
            price: config.price,
            dateRange: config.dateRange,
            year: config.year,
            month: config.month,
            quarter: config.quarter,
          }),
        },
      );

      if (!generateResponse.ok) {
        const error = await generateResponse.text();
        throw new Error(`Pack generation failed: ${error}`);
      }

      const { pack } = await generateResponse.json();
      console.log(`   📦 Pack generated and uploaded to Blob: ${pack.id}`);

      // Step 2: Create Stripe product as SSOT (with Blob URL from pack)
      const stripeResponse = await fetch(
        `${BASE_URL}/api/shop/stripe/create-product`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pack: {
              ...pack,
              // Ensure Blob URL is passed to Stripe metadata
              blobUrl: pack.downloadUrl,
              blobKey: pack.downloadUrl?.split('/').pop(),
            },
          }),
        },
      );

      if (!stripeResponse.ok) {
        const error = await stripeResponse.text();
        throw new Error(`Stripe product creation failed: ${error}`);
      }

      const { stripeProductId, stripePriceId } = await stripeResponse.json();
      console.log(`   💳 Stripe product created (SSOT): ${stripeProductId}`);
      console.log(`   ✅ Complete automation finished successfully`);

      // TODO: Save pack data to database when database is implemented
      // For now, we're relying on Stripe as the source of truth
    } catch (error) {
      console.error(`   ❌ Failed to create pack: ${error}`);
      throw error;
    }
  }

  private async packExists(config: PackConfig): Promise<boolean> {
    try {
      // Check Stripe for existing products with matching metadata
      const products = await stripe.products.search({
        query: `metadata['category']:'${config.category}' AND metadata['subcategory']:'${config.subcategory}'`,
        limit: 1,
      });

      return products.data.length > 0;
    } catch (error) {
      console.warn('   ⚠️ Could not check for existing packs:', error);
      return false;
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up old packs...');

    try {
      // Find old packs (older than 2 years)
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 2);

      const products = await stripe.products.search({
        query: `metadata['category']:'moon_phases'`,
        limit: 100,
      });

      let deactivatedCount = 0;

      for (const product of products.data) {
        const subcategory = product.metadata.subcategory;
        if (!subcategory) continue;

        // Parse year from subcategory (format: YYYY or YYYY-MM or YYYY-QN)
        const yearMatch = subcategory.match(/^(\d{4})/);
        if (!yearMatch) continue;

        const packYear = parseInt(yearMatch[1]);
        if (packYear < cutoffDate.getFullYear()) {
          if (!this.dryRun && product.active) {
            await stripe.products.update(product.id, { active: false });
            deactivatedCount++;
            console.log(`   🗑️ Deactivated old pack: ${product.name}`);
          } else if (this.dryRun) {
            console.log(`   🗑️ [DRY RUN] Would deactivate: ${product.name}`);
            deactivatedCount++;
          }
        }
      }

      console.log(
        `   ✅ Cleanup completed. ${deactivatedCount} old packs ${this.dryRun ? 'would be' : ''} deactivated.`,
      );
    } catch (error) {
      console.error('   ❌ Cleanup failed:', error);
    }
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const typeArg = args.find((arg) => arg.startsWith('--type='));
  const type = typeArg
    ? (typeArg.split('=')[1] as 'monthly' | 'quarterly' | 'yearly' | 'all')
    : 'all';

  if (type && !['monthly', 'quarterly', 'yearly', 'all'].includes(type)) {
    console.error('❌ Invalid type. Use: monthly, quarterly, yearly, or all');
    process.exit(1);
  }

  const generator = new MoonPackGenerator(dryRun);

  await generator.generatePacks(type);
  await generator.cleanup();

  console.log('\n🌙 Moon pack automation completed!');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { MoonPackGenerator };
