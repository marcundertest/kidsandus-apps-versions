import { IScraper, ScrapeResult, StoreConfig } from './types';
import { HuaweiResponseSchema } from '../schemas';

export class HuaweiScraper implements IScraper {
  async scrape(config: StoreConfig): Promise<ScrapeResult> {
    const appId = config.appId;
    if (!appId) throw new Error('Missing appId');

    const identityId = this.generateIdentityId();

    const codeUrl = 'https://web-dre.hispace.dbankcloud.com/edge/webedge/getInterfaceCode';
    const codeResponse = await fetch(codeUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Identity-Id': identityId,
        Referer: 'https://appgallery.huawei.com/',
        Origin: 'https://appgallery.huawei.com',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!codeResponse.ok) throw new Error(`Failed to get interface code: ${codeResponse.status}`);

    const jwtBase = await codeResponse.json();
    if (typeof jwtBase !== 'string') {
      throw new Error('Invalid Interface-Code response format');
    }

    const interfaceCode = `${jwtBase}_${Date.now()}`;

    const apiUrl = `https://web-dre.hispace.dbankcloud.com/edge/uowap/index?method=internal.getTabDetail&serviceType=20&reqPageNum=1&maxResults=25&uri=app%7C${appId}&appid=${appId}&zone=&locale=es_ES`;

    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Identity-Id': identityId,
        'Interface-Code': interfaceCode,
        Referer: 'https://appgallery.huawei.com/',
        Origin: 'https://appgallery.huawei.com',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status} fetching details`);

    const json = await response.json();
    const parsed = HuaweiResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error('Huawei API schema validation failed:', parsed.error);
      throw new Error('Invalid Huawei API response structure');
    }

    const data = parsed.data;

    let version = 'N/A';
    let lastUpdateDate = 'N/A';
    let icon = '';

    if (data.layoutData) {
      for (const layout of data.layoutData) {
        if (layout.dataList && layout.dataList.length > 0) {
          const item = layout.dataList[0];
          if (item.versionName || item.version) {
            version = item.versionName || item.version || 'N/A';
          }
          if (item.releaseDate || item.updateTime) {
            lastUpdateDate = item.releaseDate || item.updateTime || 'N/A';
          }
          if (item.icon && !icon) {
            icon = item.icon;
          }
        }
      }
    }

    if (version === 'N/A' && lastUpdateDate === 'N/A') {
      throw new Error('Could not find app details in Huawei response structure');
    }

    return {
      version,
      lastUpdateDate: this.formatDate(lastUpdateDate),
      icon,
    };
  }

  private formatDate(dateStr: string): string {
    if (!dateStr || dateStr === 'N/A') return dateStr;

    // Huawei format is D/M/YYYY (e.g., 1/1/2026 or 13/1/2026)
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${day}/${month}/${year}`;
    }

    return dateStr;
  }

  private generateIdentityId(): string {
    // Generate a dashless UUID v4
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
