import { startWorker } from 'jazz-tools/worker';
import type { Loaded } from 'jazz-tools';
import { MyAppAccount } from '../../../schema';

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

    const account = await MyAppAccount.load(userId, {
      loadAs: worker,
      resolve: { profile: true },
    });

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
