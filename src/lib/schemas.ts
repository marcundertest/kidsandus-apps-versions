import { z } from 'zod';

// Microsoft Store Scraper Schema
export const MicrosoftStoreResponseSchema = z.object({
  installer: z
    .object({
      architectures: z.record(
        z.string(),
        z.object({
          version: z.string().optional(),
        })
      ),
    })
    .optional(),
  packageLastUpdateDateUtc: z.string().optional(),
  iconUrl: z.string().optional(),
});

// App Store (iTunes) Scraper Schema
export const ItunesResponseSchema = z.object({
  results: z.array(
    z.object({
      version: z.string().optional(),
      currentVersionReleaseDate: z.string().optional(),
      artworkUrl512: z.string().optional(),
      artworkUrl100: z.string().optional(),
    })
  ),
});

// Huawei AppGallery Scraper Schema
export const HuaweiResponseSchema = z.object({
  layoutData: z
    .array(
      z.object({
        dataList: z
          .array(
            z.object({
              versionName: z.string().optional(),
              version: z.string().optional(),
              releaseDate: z.string().optional(),
              updateTime: z.string().optional(),
              icon: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
});
