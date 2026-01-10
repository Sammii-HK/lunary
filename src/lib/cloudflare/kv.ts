const ACCOUNT_ID = process.env.CLOUDFLARE_KV_ACCOUNT_ID;
const NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
const API_TOKEN = process.env.CLOUDFLARE_KV_API_TOKEN;

const BASE_URL =
  ACCOUNT_ID && NAMESPACE_ID
    ? `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values`
    : null;

type KVClient = {
  put: (key: string, value: string, ttlSeconds?: number) => Promise<boolean>;
  get: (key: string) => Promise<string | null>;
};

const memoryStore = new Map<string, { value: string; expiresAt?: number }>();

const cleanMemoryStore = () => {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.expiresAt && entry.expiresAt <= now) {
      memoryStore.delete(key);
    }
  }
};

const cloudflareClient: KVClient | null =
  BASE_URL && API_TOKEN
    ? {
        async put(key, value, ttlSeconds) {
          try {
            const url = `${BASE_URL}/${encodeURIComponent(key)}`;
            const headers: Record<string, string> = {
              Authorization: `Bearer ${API_TOKEN}`,
              'Content-Type': 'application/json',
            };
            if (ttlSeconds) {
              headers['X-TTL'] = String(ttlSeconds);
            }
            const response = await fetch(url, {
              method: 'PUT',
              headers,
              body: value,
            });
            return response.ok;
          } catch (error) {
            console.error('[CloudflareKV] put failed', error);
            return false;
          }
        },
        async get(key) {
          try {
            const url = `${BASE_URL}/${encodeURIComponent(key)}`;
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
            });
            if (response.status === 404) return null;
            if (!response.ok) {
              console.error(
                '[CloudflareKV] get failed',
                response.status,
                await response.text(),
              );
              return null;
            }
            return response.text();
          } catch (error) {
            console.error('[CloudflareKV] get failed', error);
            return null;
          }
        },
      }
    : null;

const memoryClient: KVClient = {
  async put(key, value, ttlSeconds) {
    const expiresAt =
      ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : undefined;
    memoryStore.set(key, { value, expiresAt });
    return true;
  },
  async get(key) {
    cleanMemoryStore();
    const entry = memoryStore.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      memoryStore.delete(key);
      return null;
    }
    return entry.value;
  },
};

const client: KVClient = cloudflareClient ?? memoryClient;

export async function kvPut(
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<boolean> {
  return client.put(key, value, ttlSeconds);
}

export async function kvGet(key: string): Promise<string | null> {
  return client.get(key);
}
