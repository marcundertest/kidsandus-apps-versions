import { IScraper, ScrapeResult, StoreConfig } from './types';
import { formatDate } from '../utils/date';

export class MicrosoftStoreScraper implements IScraper {
  async scrape(config: StoreConfig): Promise<ScrapeResult> {
    const productId = config.productId;
    if (!productId) throw new Error('Missing productId');

    const apiUrl = `https://apps.microsoft.com/api/ProductsDetails/GetProductDetailsById/${productId}?gl=ES&hl=es-ES`;
    const response = await fetch(apiUrl);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    let version = 'N/A';

    if (data.installer?.architectures) {
      const architectures = Object.values(data.installer.architectures) as { version?: string }[];
      if (architectures.length > 0 && architectures[0].version) {
        version = architectures[0].version;
      }
    }

    return {
      version,
      lastUpdateDate: data.packageLastUpdateDateUtc
        ? formatDate(data.packageLastUpdateDateUtc)
        : 'N/A',
      icon: data.iconUrl || '',
    };
  }
}
