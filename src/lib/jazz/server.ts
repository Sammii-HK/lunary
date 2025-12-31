import { startWorker } from 'jazz-tools/worker';
import type { Loaded } from 'jazz-tools';
import { MyAppAccount } from '../../../schema';
import { sql } from '@vercel/postgres';

type WorkerInstance = Awaited<
  ReturnType<typeof startWorker<typeof MyAppAccount>>
>;

let workerPromise: Promise<WorkerInstance> | null = null;

async function getWorker(): Promise<Loaded<typeof MyAppAccount> | null> {
  console.log('[jazz/server] getWorker called');
  console.log('[jazz/server] Env check:', {
    hasAccount: !!process.env.JAZZ_WORKER_ACCOUNT,
    hasSecret: !!process.env.JAZZ_WORKER_SECRET,
    accountPrefix: process.env.JAZZ_WORKER_ACCOUNT?.substring(0, 10),
  });

  if (!process.env.JAZZ_WORKER_ACCOUNT || !process.env.JAZZ_WORKER_SECRET) {
    console.error(
      '[jazz/server] Missing JAZZ worker credentials. Unable to load Jazz profiles.',
    );
    return null;
  }

  if (!workerPromise) {
    console.log('[jazz/server] Starting new worker...');
    workerPromise = startWorker({
      AccountSchema: MyAppAccount,
      accountID: process.env.JAZZ_WORKER_ACCOUNT,
      accountSecret: process.env.JAZZ_WORKER_SECRET,
      syncServer:
        process.env.JAZZ_SYNC_SERVER ||
        `wss://cloud.jazz.tools/?key=${process.env.JAZZ_SYNC_KEY || ''}`,
      skipInboxLoad: true,
      asActiveAccount: false,
    })
      .then((result) => {
        console.log('[jazz/server] Worker started successfully');
        return result;
      })
      .catch((error) => {
        console.error('[jazz/server] Failed to start Jazz worker', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        workerPromise = null;
        throw error;
      });
  } else {
    console.log('[jazz/server] Reusing existing worker promise');
  }

  try {
    console.log('[jazz/server] Awaiting worker promise...');
    const { worker } = await workerPromise;
    console.log('[jazz/server] Worker retrieved successfully');
    return worker;
  } catch (error) {
    console.error('[jazz/server] Unable to retrieve Jazz worker', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
}

async function getLegacyAccountId(userId: string): Promise<string | null> {
  if (!process.env.POSTGRES_URL) {
    return null;
  }

  try {
    const result = await sql`
      SELECT jazz_account_id
      FROM jazz_migration_status
      WHERE user_id = ${userId}
      LIMIT 1
    `;
    const accountId = result.rows[0]?.jazz_account_id;
    return typeof accountId === 'string' && accountId.length > 0
      ? accountId
      : null;
  } catch (error: any) {
    if (error?.code === '42P01') {
      console.warn('[jazz/server] jazz_migration_status table missing');
      return null;
    }
    console.error('[jazz/server] Failed to query migration status', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function loadJazzProfile(userId: string) {
  console.log('[jazz/server] loadJazzProfile called for userId:', userId);
  try {
    console.log('[jazz/server] Getting worker...');
    const worker = await getWorker();
    if (!worker) {
      console.warn('[jazz/server] No worker available');
      return null;
    }
    console.log('[jazz/server] Worker obtained, loading account...');
    const loadAccount = async (accountId: string) =>
      MyAppAccount.load(accountId, {
        loadAs: worker,
        resolve: { profile: true },
      });

    let account: Loaded<typeof MyAppAccount> | null = null;
    const legacyAccountId = await getLegacyAccountId(userId);
    const looksLikeUuid = /^[0-9a-f]{8}-/i.test(userId);

    if (legacyAccountId && legacyAccountId !== userId) {
      console.warn('[jazz/server] Using legacy account id', {
        userId,
        legacyAccountId,
      });
      account = await loadAccount(legacyAccountId);
    } else if (looksLikeUuid) {
      console.warn(
        '[jazz/server] Skipping legacy load for uuid without mapping',
        { userId },
      );
      return null;
    } else {
      try {
        account = await loadAccount(userId);
      } catch (error: any) {
        const message =
          error instanceof Error ? error.message : String(error || '');
        const isInvalidId =
          typeof message === 'string' &&
          message.toLowerCase().includes('invalid');
        if (isInvalidId) {
          throw error;
        }
        throw error;
      }
    }

    console.log('[jazz/server] Account loaded:', {
      hasAccount: !!account,
      hasProfile: !!account?.profile,
      profileKeys: account?.profile ? Object.keys(account.profile as any) : [],
    });

    const profile = account?.profile ?? null;
    if (profile) {
      console.log('[jazz/server] Profile data:', {
        hasBirthday: !!(profile as any)?.birthday,
        birthday: (profile as any)?.birthday,
        hasName: !!(profile as any)?.name,
        name: (profile as any)?.name,
      });
    }

    return profile;
  } catch (error) {
    console.error('[jazz/server] Failed to load Jazz profile', {
      userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
}
