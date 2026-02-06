import { IScraper, ScrapeResult, StoreConfig } from './types';
import { formatDate } from '../utils/date';
import { ItunesResponseSchema } from '../schemas';

export class AppStoreScraper implements IScraper {
  async scrape(config: StoreConfig): Promise<ScrapeResult> {
    const appId = config.appId;
    if (!appId) throw new Error('Missing appId');

    const apiUrl = `https://itunes.apple.com/lookup?id=${appId}`;
    const response = await fetch(apiUrl);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();
    const parsed = ItunesResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error('iTunes API schema validation failed:', parsed.error);
      throw new Error('Invalid iTunes API response structure');
    }

    const data = parsed.data;

    if (!data.results || data.results.length === 0) {
      throw new Error('App not found');
    }

    const app = data.results[0];
    return {
      version: app.version || 'N/A',
      lastUpdateDate: app.currentVersionReleaseDate
        ? formatDate(app.currentVersionReleaseDate)
        : 'N/A',
      icon: app.artworkUrl512 || app.artworkUrl100 || '',
    };
  }
}
