import { config } from 'dotenv';
import { resolve } from 'path';
import { execFileSync } from 'child_process';
import { resolveFxDriftUpdates } from '../utils/fx-drift-resolve';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const TARGET_FILE = 'utils/stripe-prices.ts';

function runCmd(command: string, args: string[] = []) {
  return execFileSync(command, args, { stdio: 'inherit' });
}

function runCmdOutput(command: string, args: string[] = []): string {
  return execFileSync(command, args, { encoding: 'utf-8' }).trim();
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
  const status = runOutput('git', ['status', '--porcelain']);
    updateMap: true,
  });

  const status = runCmdOutput('git', ['status', '--porcelain']);
  const hasTargetChange = status
    .split('\n')
    .some((line) => line.includes(TARGET_FILE));

  if (!hasTargetChange) {
  run('git', ['add', TARGET_FILE]);
  run('git', ['commit', '-m', message]);
  }

  runCmd('git', ['add', TARGET_FILE]);
  runCmd('git', ['commit', '-m', message]);

  if (pr) {
    const branch = runCmdOutput('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    const title = 'Update Stripe price mapping';
    const body = [
      '## Summary',
      '- Regenerate Stripe price mapping after FX drift auto-apply',
      '',
    run('gh', [
      'pr',
      'create',
      '--title',
      title,
      '--body',
      body,
      '--head',
      branch,
    ]);
      '--title',
      title,
      '--body',
      body,
      '--head',
      branch,
    ]);
    ].join('\n');
    runCmd('gh', [
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
