import { config } from 'dotenv';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { resolveFxDriftUpdates } from '../utils/fx-drift-resolve';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const TARGET_FILE = 'utils/stripe-prices.ts';

function run(command: string) {
  return execSync(command, { stdio: 'inherit' });
}

function runArgs(command: string, args: string[]) {
  return execSync(command, { stdio: 'inherit', args });
}

function runOutput(command: string): string {
  return execSync(command, { encoding: 'utf-8' }).trim();
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    pr: args.includes('--pr'),
    message:
      args.find((arg) => arg.startsWith('--message='))?.split('=')[1] ??
      'chore(pricing): refresh stripe price mapping',
  };
}

async function main() {
  const { pr, message } = parseArgs();

  await resolveFxDriftUpdates({
    apply: true,
    updateMap: true,
  });

  const status = runOutput('git status --porcelain');
  const hasTargetChange = status
    .split('\n')
    .some((line) => line.includes(TARGET_FILE));

  if (!hasTargetChange) {
    console.log('No mapping changes to commit.');
    return;
  }

  run(`git add ${TARGET_FILE}`);
  runArgs('git', ['commit', '-m', message]);

  if (pr) {
    const branch = runOutput('git rev-parse --abbrev-ref HEAD');
    const title = 'Update Stripe price mapping';
    const body = [
      '## Summary',
      '- Regenerate Stripe price mapping after FX drift auto-apply',
      '',
      '## Test plan',
      '- N/A',
      '',
    ].join('\n');
    runArgs('gh', [
      'pr',
      'create',
      '--title',
      title,
      '--body',
      body,
      '--head',
      branch,
    ]);
  }
}

main().catch((error) => {
  console.error('FX apply + commit failed:', error);
  process.exit(1);
});
