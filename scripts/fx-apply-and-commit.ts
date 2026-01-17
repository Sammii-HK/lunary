import { config } from 'dotenv';
import { promises as fs } from 'fs';
import { resolve } from 'path';
import { execFileSync } from 'child_process';
import { resolveFxDriftUpdates } from '../utils/fx-drift-resolve';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const TARGET_FILE = 'utils/stripe-prices.ts';
const TARGET_FILE_PATH = resolve(process.cwd(), TARGET_FILE);

function runCmd(command: string, args: string[] = []) {
  return execFileSync(command, args, { stdio: 'inherit' });
}

function runCmdOutput(command: string, args: string[] = []): string {
  return execFileSync(command, args, { encoding: 'utf-8' }).trim();
}

function parseArgs() {
  const args = process.argv.slice(2);
  const messageArg = args.find((arg) => arg.startsWith('--message='));
  const message = messageArg
    ? messageArg.split('=')[1]
    : 'chore(pricing): refresh stripe price mapping';

  return {
    pr: args.includes('--pr'),
    message: message.trim(),
  };
}

async function updatePriceMapping(
  mapping: Record<string, Record<string, unknown>>,
) {
  const fileContent = await fs.readFile(TARGET_FILE_PATH, 'utf-8');
  const mappingRegex =
    /export const STRIPE_PRICE_MAPPING = [\s\S]*?} as const;/;
  if (!mappingRegex.test(fileContent)) {
    throw new Error('Could not locate the existing price mapping block.');
  }

  const updatedMapping = JSON.stringify(mapping, null, 2);
  const replacement = `export const STRIPE_PRICE_MAPPING = ${updatedMapping} as const;`;
  const updatedContent = fileContent
    .replace(mappingRegex, replacement)
    .replace(/Last updated: .*/, `Last updated: ${new Date().toISOString()}`);

  if (updatedContent === fileContent) {
    console.log('Price mapping file already contains the latest values.');
    return;
  }

  await fs.writeFile(TARGET_FILE_PATH, updatedContent, 'utf-8');
}

async function main() {
  const { pr, message } = parseArgs();

  const { updates, updatedMapping } = await resolveFxDriftUpdates({
    apply: true,
    updateMap: true,
  });

  if (updates.length === 0) {
    console.log('✅ No FX drift updates needed right now.');
    return;
  }

  if (!updatedMapping) {
    console.log(
      '⚠️  FX drift updates detected but no mapping changes were generated.',
    );
    return;
  }

  await updatePriceMapping(updatedMapping);

  const status = runCmdOutput('git', ['status', '--porcelain', TARGET_FILE]);
  if (!status) {
    console.log(
      '⚠️  No changes detected in the price mapping after applying FX updates.',
    );
    return;
  }

  runCmd('git', ['add', TARGET_FILE]);
  runCmd('git', ['commit', '-m', message]);

  if (pr) {
    const branch = runCmdOutput('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    const body = [
      '## Summary',
      '- Regenerate Stripe price mapping after applying FX drift updates',
      '',
      '## Testing',
      '- n/a',
    ].join('\n');

    runCmd('gh', [
      'pr',
      'create',
      '--title',
      'Update Stripe price mapping',
      '--body',
      body,
      '--head',
      branch,
    ]);
  }

  console.log(
    `✅ Applied ${updates.length} FX drift update(s) and committed ${TARGET_FILE}.`,
  );
}

main().catch((error) => {
  console.error('FX apply + commit failed:', error);
  process.exit(1);
});
