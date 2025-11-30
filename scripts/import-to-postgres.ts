#!/usr/bin/env tsx
/**
 * Import Jazz Export to PostgreSQL
 *
 * Imports user profile data from Jazz export into PostgreSQL.
 * Includes encryption for sensitive data (birthday).
 *
 * Prerequisites:
 * - jazz_export_data.json from export script
 * - POSTGRES_URL in .env.local
 * - ENCRYPTION_KEY in .env.local (for birthday encryption)
 *
 * Run with: pnpm tsx scripts/import-to-postgres.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import { sql } from '@vercel/postgres';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// ============================================
// Encryption Utilities
// ============================================

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || process.env.BETTER_AUTH_SECRET;
  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY or BETTER_AUTH_SECRET required for encryption',
    );
  }
  // Derive a 32-byte key from the secret
  return scryptSync(key, 'lunary-salt', 32);
}

function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const parts = encryptedText.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// ============================================
// Import Types
// ============================================

interface ExportedProfile {
  userId: string;
  email: string;
  jazzAccountId?: string;
  profile: {
    name?: string;
    birthday?: string;
    birthTime?: string;
    birthLocation?: string;
    birthChart?: any[];
    personalCard?: any;
    subscription?: any;
    stripeCustomerId?: string;
    location?: any;
  } | null;
  notes: any[];
  exportedAt: string;
}

interface ExportData {
  exportedAt: string;
  userCount: number;
  profiles: ExportedProfile[];
  errors: any[];
}

// ============================================
// Main Import Function
// ============================================

async function importToPostgres() {
  console.log('🚀 Jazz to PostgreSQL Import Script');
  console.log('====================================\n');

  // Check for export file
  const exportPath = resolve(process.cwd(), 'jazz_export_data.json');

  if (!existsSync(exportPath)) {
    console.error('❌ Export file not found: jazz_export_data.json');
    console.error(
      '   Run the export script first: pnpm tsx scripts/export-jazz-data.ts',
    );
    process.exit(1);
  }

  // Load export data
  console.log('📂 Loading export file...');
  let exportData: ExportData;

  try {
    const fileContent = readFileSync(exportPath, 'utf-8');
    exportData = JSON.parse(fileContent);
    console.log(`✅ Loaded ${exportData.profiles.length} profiles from export`);
    console.log(`   Exported at: ${exportData.exportedAt}`);
  } catch (error) {
    console.error('❌ Failed to load export file:', error);
    process.exit(1);
  }

  // Filter profiles with actual data
  const profilesWithData = exportData.profiles.filter(
    (p) => p.profile?.name || p.profile?.birthday,
  );

  console.log(`\n👥 Profiles with data: ${profilesWithData.length}`);

  if (profilesWithData.length === 0) {
    console.log('⚠️  No profiles with data to import');
    console.log(
      '   This might mean Jazz was not actively used for profile storage',
    );
    process.exit(0);
  }

  // Test encryption
  console.log('\n🔐 Testing encryption...');
  try {
    const testEncrypted = encrypt('test-birthday');
    const testDecrypted = decrypt(testEncrypted);
    if (testDecrypted !== 'test-birthday') {
      throw new Error('Encryption/decryption mismatch');
    }
    console.log('✅ Encryption working correctly');
  } catch (error) {
    console.error('❌ Encryption test failed:', error);
    console.error('   Make sure ENCRYPTION_KEY or BETTER_AUTH_SECRET is set');
    process.exit(1);
  }

  // Import profiles
  console.log('\n📦 Importing profiles to PostgreSQL...\n');

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const exportedProfile of profilesWithData) {
    process.stdout.write(`   Importing ${exportedProfile.email}... `);

    try {
      const profile = exportedProfile.profile;

      if (!profile) {
        console.log('⚠️  No profile data');
        skipped++;
        continue;
      }

      // Encrypt birthday if present
      const encryptedBirthday = profile.birthday
        ? encrypt(profile.birthday)
        : null;

      // Insert/update user_profiles
      await sql`
        INSERT INTO user_profiles (
          user_id,
          name,
          birthday,
          birth_chart,
          personal_card,
          location,
          stripe_customer_id
        )
        VALUES (
          ${exportedProfile.userId},
          ${profile.name || null},
          ${encryptedBirthday},
          ${profile.birthChart ? JSON.stringify(profile.birthChart) : null}::jsonb,
          ${profile.personalCard ? JSON.stringify(profile.personalCard) : null}::jsonb,
          ${profile.location ? JSON.stringify(profile.location) : null}::jsonb,
          ${profile.stripeCustomerId || null}
        )
        ON CONFLICT (user_id) DO UPDATE SET
          name = COALESCE(EXCLUDED.name, user_profiles.name),
          birthday = COALESCE(EXCLUDED.birthday, user_profiles.birthday),
          birth_chart = COALESCE(EXCLUDED.birth_chart, user_profiles.birth_chart),
          personal_card = COALESCE(EXCLUDED.personal_card, user_profiles.personal_card),
          location = COALESCE(EXCLUDED.location, user_profiles.location),
          stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, user_profiles.stripe_customer_id),
          updated_at = NOW()
      `;

      // Track migration status
      await sql`
        INSERT INTO jazz_migration_status (
          user_id,
          migration_status,
          migrated_at,
          jazz_account_id
        )
        VALUES (
          ${exportedProfile.userId},
          'completed',
          NOW(),
          ${exportedProfile.jazzAccountId || null}
        )
        ON CONFLICT (user_id) DO UPDATE SET
          migration_status = 'completed',
          migrated_at = NOW(),
          jazz_account_id = EXCLUDED.jazz_account_id
      `;

      // Import notes if any
      if (exportedProfile.notes && exportedProfile.notes.length > 0) {
        for (const note of exportedProfile.notes) {
          if (note.content) {
            await sql`
              INSERT INTO user_notes (user_id, title, content, created_at)
              VALUES (
                ${exportedProfile.userId},
                ${note.title || null},
                ${note.content},
                ${note.createdAt ? new Date(note.createdAt) : new Date()}
              )
              ON CONFLICT DO NOTHING
            `;
          }
        }
      }

      imported++;
      console.log('✅ Imported');
    } catch (error) {
      console.log('❌ Error');
      console.error(
        `      ${error instanceof Error ? error.message : String(error)}`,
      );
      errors++;
    }
  }

  // Summary
  console.log('\n====================================');
  console.log('📊 Import Summary');
  console.log('====================================');
  console.log(`   Profiles with data: ${profilesWithData.length}`);
  console.log(`   Successfully imported: ${imported}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);

  if (imported > 0) {
    console.log('\n✅ Import complete!');
    console.log('   Birthday data has been encrypted in the database.');
    console.log('\n🔄 Next steps:');
    console.log(
      '   1. Run validation: pnpm tsx scripts/validate-migration-complete.ts',
    );
    console.log('   2. Deploy the new code');
    console.log('   3. Remove Jazz environment variables from production');
  }

  process.exit(errors > 0 ? 1 : 0);
}

// Export decryption function for use in the app
export { decrypt as decryptBirthday, encrypt as encryptBirthday };

// Run the import
importToPostgres().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
