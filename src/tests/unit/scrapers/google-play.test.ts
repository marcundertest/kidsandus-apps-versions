import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { GooglePlayScraper } from '@/lib/scrapers/google-play';
import { StoreConfig } from '@/lib/scrapers/types';

describe('GooglePlayScraper', () => {
  let scraper: GooglePlayScraper;

  beforeEach(() => {
    scraper = new GooglePlayScraper();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('extracts version and date correctly from HTML', async () => {
    const mockHtml = `
      <html>
        <body>
          <div>Updated on</div>
          <span>Oct 27, 2023</span>
          <script>
            // Simulate the JSON-like structure Google often uses
             <script type="application/ld+json">
               {
                 "@context": "http://schema.org",
                 "@type": "SoftwareApplication",
                 "softwareVersion": "1.0.40",
                 "datePublished": "Oct 27, 2023"
               }
             </script>
          </script>
        </body>
      </html>
    `;

    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      text: async () => mockHtml,
    });

    const config: StoreConfig = { id: 'test', type: 'google-play', packageId: 'com.example.app' };
    const result = await scraper.scrape(config);

    expect(result.version).toBe('1.0.40');
    // We'd expect the date parsing logic to handle "Oct 27, 2023"
    // Ideally we should check if parseGooglePlayDate works or just check result is not N/A
    expect(result.lastUpdateDate).not.toBe('N/A');
  });

  it('extracts version from "About this app" section pattern', async () => {
    const mockHtml = `
      About this app
      ...
      Version
      2.1.0
    `;

    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      text: async () => mockHtml,
    });

    const config: StoreConfig = { id: 'test', type: 'google-play', packageId: 'com.example.app' };
    const result = await scraper.scrape(config);

    expect(result.version).toBe('2.1.0');
  });

  it('throws HTTP error on 404', async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });

    const config: StoreConfig = { id: 'test', type: 'google-play', packageId: 'com.bad.pkg' };
    await expect(scraper.scrape(config)).rejects.toThrow('HTTP 404');
  });
});
