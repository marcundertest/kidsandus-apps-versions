import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { AppStoreScraper } from './app-store';
import { StoreConfig } from './types';

describe('AppStoreScraper', () => {
  let scraper: AppStoreScraper;

  beforeEach(() => {
    scraper = new AppStoreScraper();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('extracts version correctly from valid JSON response', async () => {
    const mockData = {
      results: [
        {
          version: '2.5.1',
          currentVersionReleaseDate: '2023-10-27T10:00:00Z',
          artworkUrl512: 'https://example.com/icon.png',
        },
      ],
    };

    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const config: StoreConfig = { id: 'test', type: 'itunes', appId: '123456' };
    const result = await scraper.scrape(config);
    expect(result.version).toBe('2.5.1');
    expect(result.icon).toBe('https://example.com/icon.png');
  });

  it('throws error if app is not found (empty results)', async () => {
    const mockData = {
      results: [],
    };

    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const config: StoreConfig = { id: 'test', type: 'itunes', appId: '123456' };
    await expect(scraper.scrape(config)).rejects.toThrow('App not found');
  });

  it('throws Zod error if response structure is invalid', async () => {
    const invalidData = {
      results: 'not-an-array', // Invalid type
    };

    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => invalidData,
    });

    const config: StoreConfig = { id: 'test', type: 'itunes', appId: '123456' };
    await expect(scraper.scrape(config)).rejects.toThrow('Invalid iTunes API response structure');
  });

  it('throws HTTP error on 404', async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });

    const config: StoreConfig = { id: 'test', type: 'itunes', appId: '123456' };
    await expect(scraper.scrape(config)).rejects.toThrow('HTTP 404');
  });
});
