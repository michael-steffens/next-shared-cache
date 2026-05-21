import type { CacheHandlerValue, IncrementalCacheValue } from '@repo/next-common';
import type { LRUCache } from 'lru-cache';

import type { LruCacheOptions } from '../create-configured-cache';
import { createConfiguredCache } from '../create-configured-cache';

function calculateObjectSize({ value }: CacheHandlerValue): number {
  // Return default size if value is falsy
  if (!value) {
    return 25;
  }

  switch (value.kind) {
    case 'REDIRECT': {
      // Calculate size based on the length of the stringified props
      return JSON.stringify((value as { props: object }).props).length;
    }
    case 'IMAGE': {
      // Throw a specific error for image kind
      throw new Error(
        'Image kind should not be used for incremental-cache calculations.',
      );
    }
    case 'FETCH': {
      // Calculate size based on the length of the stringified data
      return JSON.stringify((value as { data: object }).data || '').length;
    }
    case 'APP_ROUTE': {
      // Size based on the length of the body
      return (value as { body: Buffer }).body.length;
    }
    default: {
      // Rough estimate calculation for other types (PAGES, APP_PAGE)
      // Combine HTML length and page data length
      const pageData = (value as { pageData?: object }).pageData;
      const pageDataLength = pageData ? JSON.stringify(pageData).length : 0;
      return (value as { html: string }).html.length + pageDataLength;
    }
  }
}

export type { LruCacheOptions };

export default function createCacheStore(
  options?: LruCacheOptions,
): LRUCache<string, CacheHandlerValue> {
  return createConfiguredCache(calculateObjectSize, options);
}
