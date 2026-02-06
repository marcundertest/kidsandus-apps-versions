export interface ScrapeResult {
  version: string;
  lastUpdateDate: string;
  icon?: string;
  error?: string;
}

export interface StoreConfig {
  id: string;
  type: 'google-play' | 'itunes' | 'microsoft' | 'huawei';
  packageId?: string;
  appId?: string;
  productId?: string;
}

export interface IScraper {
  scrape(config: StoreConfig): Promise<ScrapeResult>;
}
