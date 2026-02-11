/**
 * Tests for embedding generation caching
 * Verifies that duplicate queries don't trigger multiple OpenAI API calls
 */

// Mock OpenAI before importing the module
const mockCreate = jest.fn().mockResolvedValue({
  data: [{ embedding: Array(1536).fill(0.1) }],
});

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    embeddings: { create: mockCreate },
  }));
});

jest.mock('@vercel/postgres', () => ({
  sql: jest.fn(),
}));

// Must set env vars before importing the module
process.env.OPENAI_API_KEY = 'test-key';
process.env.POSTGRES_URL = 'postgres://test';
// Ensure we're not in test mode for these tests
const originalNodeEnv = process.env.NODE_ENV;

describe('generateEmbedding caching', () => {
  let generateEmbedding: (text: string) => Promise<number[]>;

  beforeAll(async () => {
    // Override NODE_ENV so isTestMode() returns false
    process.env.NODE_ENV = 'development';
    process.env.CI = '';
    process.env.SKIP_AUTH = '';
    process.env.BYPASS_AUTH = '';

    const mod = await import('@/lib/embeddings/index');
    generateEmbedding = mod.generateEmbedding;
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  beforeEach(() => {
    mockCreate.mockClear();
  });

  it('calls OpenAI API on first request', async () => {
    const result = await generateEmbedding('test query unique 1');
    expect(result).toHaveLength(1536);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('returns cached result on duplicate query without calling API again', async () => {
    const query = 'duplicate query test';

    await generateEmbedding(query);
    const callCountAfterFirst = mockCreate.mock.calls.length;

    await generateEmbedding(query);
    expect(mockCreate).toHaveBeenCalledTimes(callCountAfterFirst);
  });

  it('calls API for different queries', async () => {
    mockCreate.mockClear();

    await generateEmbedding('query A unique');
    await generateEmbedding('query B unique');

    expect(mockCreate).toHaveBeenCalledTimes(2);
  });
});
