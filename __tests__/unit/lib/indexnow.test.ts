import { GET as getIndexNowKeyFile } from '@/app/indexnow-key.txt/route';
import { getIndexNowConfig, submitIndexNowUrls } from '@/lib/indexnow';

const originalEnv = process.env;

describe('IndexNow helpers', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    process.env = { ...originalEnv };
    delete process.env.INDEXNOW_KEY;
    delete process.env.INDEXNOW_KEY_LOCATION;
    delete process.env.INDEXNOW_PUBLISH_SECRET;
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('normalizes pasted env values with spaces or newlines', async () => {
    process.env.INDEXNOW_KEY = '  abc\r\n123  ';
    process.env.INDEXNOW_KEY_LOCATION =
      ' https://lunary.app/indexnow-key.txt \n';
    process.env.INDEXNOW_PUBLISH_SECRET = '  publish\r\nsecret ';
    process.env.NEXT_PUBLIC_SITE_URL = ' https://lunary.app/ ';

    expect(getIndexNowConfig()).toEqual({
      key: 'abc123',
      keyLocation: 'https://lunary.app/indexnow-key.txt',
      publishSecret: 'publishsecret',
      baseUrl: 'https://lunary.app',
    });

    const keyFile = await getIndexNowKeyFile();
    expect(await keyFile.text()).toBe('abc123\n');
  });

  it('submits sanitized keys and canonical URLs', async () => {
    process.env.INDEXNOW_KEY = '  abc\r\n123  ';
    process.env.INDEXNOW_KEY_LOCATION = ' https://lunary.app/indexnow-key.txt ';
    process.env.NEXT_PUBLIC_SITE_URL = ' https://lunary.app/ ';

    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response('', {
        status: 200,
      }),
    );

    const result = await submitIndexNowUrls([
      '/grimoire/datasets',
      ' https://lunary.app/grimoire/datasets ',
      '/ai-citation-map.json',
    ]);

    expect(result.submitted).toEqual([
      'https://lunary.app/grimoire/datasets',
      'https://lunary.app/ai-citation-map.json',
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(String((init as RequestInit).body));

    expect(body).toMatchObject({
      host: 'lunary.app',
      key: 'abc123',
      keyLocation: 'https://lunary.app/indexnow-key.txt',
      urlList: result.submitted,
    });
  });
});
