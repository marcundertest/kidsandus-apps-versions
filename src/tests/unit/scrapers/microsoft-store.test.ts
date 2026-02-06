import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { MicrosoftStoreScraper } from '@/lib/scrapers/microsoft-store';
import { StoreConfig } from '@/lib/scrapers/types';

describe('MicrosoftStoreScraper', () => {
  let scraper: MicrosoftStoreScraper;

  beforeEach(() => {
    scraper = new MicrosoftStoreScraper();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('extracts version correctly from valid JSON response', async () => {
    const mockData = {
      installer: {
        architectures: {
          x64: { version: '1.5.0.0' },
        },
      },
      packageLastUpdateDateUtc: '2023-11-15T10:00:00Z',
      iconUrl: 'https://example.com/icon.png',
    };

    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const config: StoreConfig = { id: 'test', type: 'microsoft', productId: 'MyProduct' };
    const result = await scraper.scrape(config);
    expect(result.version).toBe('1.5.0.0');
    expect(result.icon).toBe('https://example.com/icon.png');
  });

  it('throws Zod error if response structure is invalid', async () => {
    const invalidData = {
      // Missing 'installer' and other expected fields entirely,
      // or providing wrong types to trigger Zod failure if strict.
      // Our schema expects optional fields but if we provide a field with wrong type it should fail.
      // Or we can simulate a completely empty object which might pass if everything is optional?
      // Let's check schemas.ts: architectures is z.record inside installer.
      // If installer is missing, it passes (optional).
      // But if installer is present but 'architectures' is wrong type...
      installer: {
        architectures: 'not-a-record', // Invalid type
      },
    };

    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => invalidData,
    });

    const config: StoreConfig = { id: 'test', type: 'microsoft', productId: 'MyProduct' };
    await expect(scraper.scrape(config)).rejects.toThrow(
      'Invalid Microsoft Store API response structure'
    );
  });

  it('throws HTTP error on 404', async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });

    const config: StoreConfig = { id: 'test', type: 'microsoft', productId: 'BadProduct' };
    await expect(scraper.scrape(config)).rejects.toThrow('HTTP 404');
  });
});
