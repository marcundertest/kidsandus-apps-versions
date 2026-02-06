import { IScraper, StoreConfig } from './types';
import { AppStoreScraper } from './app-store';
import { GooglePlayScraper } from './google-play';
import { MicrosoftStoreScraper } from './microsoft-store';
import { HuaweiScraper } from './huawei';

export class ScraperFactory {
  static getScraper(type: StoreConfig['type']): IScraper {
    switch (type) {
      case 'itunes':
        return new AppStoreScraper();
      case 'google-play':
        return new GooglePlayScraper();
      case 'microsoft':
        return new MicrosoftStoreScraper();
      case 'huawei':
        return new HuaweiScraper();
      default:
        throw new Error(`Unsupported store type: ${type}`);
    }
  }
}
