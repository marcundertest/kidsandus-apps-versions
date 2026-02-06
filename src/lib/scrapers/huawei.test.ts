import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { HuaweiScraper } from './huawei';
import { StoreConfig } from './types';

describe('HuaweiScraper', () => {
  let scraper: HuaweiScraper;

  beforeEach(() => {
    scraper = new HuaweiScraper();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('extracts version correctly from valid JSON response (Auth + Details)', async () => {
    // 1. Mock Auth Token Response
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => 'mock-jwt-token',
    });

    // 2. Mock Details Response
    const mockDetailsData = {
      layoutData: [
        {
          dataList: [
            {
              versionName: '3.0.0',
              releaseDate: '15/05/2024',
              icon: 'https://example.com/icon.png',
            },
          ],
        },
      ],
    };

    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDetailsData,
    });

    const config: StoreConfig = { id: 'test', type: 'huawei', appId: 'C123456' };
    const result = await scraper.scrape(config);

    expect(result.version).toBe('3.0.0');
    // Huawei returns 15/05/2024, our formatter might keep it or reformat depending on logic.
    // The scraper code: splits by / and rejoins. 15/05/2024 -> 15/05/2024.
    expect(result.lastUpdateDate).toBe('15/05/2024');
    expect(result.icon).toBe('https://example.com/icon.png');
  });

  it('throws error if auth token fetch fails', async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const config: StoreConfig = { id: 'test', type: 'huawei', appId: 'C123456' };
    await expect(scraper.scrape(config)).rejects.toThrow('Failed to get interface code: 500');
  });

  it('throws Zod error if response structure is invalid', async () => {
    // 1. Valid Auth
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => 'mock-jwt-token',
    });

    // 2. Invalid Details
    const invalidData = {
      layoutData: 'not-an-array',
    };

    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => invalidData,
    });

    const config: StoreConfig = { id: 'test', type: 'huawei', appId: 'C123456' };
    await expect(scraper.scrape(config)).rejects.toThrow('Invalid Huawei API response structure');
  });
});
