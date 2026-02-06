import { IScraper, ScrapeResult, StoreConfig } from './types';
import { parseGooglePlayDate } from '../utils/date';

export class GooglePlayScraper implements IScraper {
  async scrape(config: StoreConfig): Promise<ScrapeResult> {
    const packageId = config.packageId;
    if (!packageId) throw new Error('Missing packageId');

    const url = `https://play.google.com/store/apps/details?id=${packageId}&hl=en`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    let version = 'N/A';
    let lastUpdateDate = 'N/A';

    const updatedOnMatch = html.match(/>Updated on<[\s\S]{1,200}?>([\w\s,]+)</i);
    if (updatedOnMatch && updatedOnMatch[1]) {
      lastUpdateDate = parseGooglePlayDate(updatedOnMatch[1].trim());
    }

    const versionPatterns = [
      /\[\[\["([\d.]+)"\]\],\[\[\[\d+\]\],\[\[\[\d+,"[\d.]+"\]\]\]\]\]/i,
      /About this (?:app|game)[\s\S]{1,5000}?Version[\s\S]{1,300}?([\d.]+)/i,
      /Version[\s<>"]+([0-9.]+)/i,
      /"softwareVersion"\s*:\s*"([^"]+)"/i,
    ];

    for (const pattern of versionPatterns) {
      const match = html.match(pattern);
      if (match) {
        version = match[1];
        break;
      }
    }

    return {
      version,
      lastUpdateDate,
      icon: '',
    };
  }
}
