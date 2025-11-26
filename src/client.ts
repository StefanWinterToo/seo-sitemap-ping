import * as http from 'http';
import * as https from 'https';
import { NetworkError } from './types.js';

export interface HttpResponse {
  statusCode: number;
  body: string;
}

/**
 * Sends an HTTP GET request with timeout
 * @param url - The full URL to request
 * @param timeoutMs - Request timeout in milliseconds (default: 30000)
 * @returns Promise resolving to HTTP response
 */
export function httpGet(url: string, timeoutMs = 30000): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const request = client.get(url, {
      timeout: timeoutMs,
      headers: {
        'User-Agent': 'sitemap-ping-npm-package/1.0.0',
      },
    }, (response) => {
      let body = '';

      response.on('data', (chunk) => {
        body += chunk.toString();
      });

      response.on('end', () => {
        const statusCode = response.statusCode || 0;
        resolve({ statusCode, body });
      });
    });

    request.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
        reject(new NetworkError('Request timeout - server did not respond within 30 seconds'));
      } else if (error.code === 'ENOTFOUND') {
        reject(new NetworkError(`DNS resolution failed - hostname not found: ${parsedUrl.hostname}`));
      } else if (error.code === 'ECONNREFUSED') {
        reject(new NetworkError('Connection refused - server is not accepting connections'));
      } else {
        reject(new NetworkError(`Network error: ${error.message}`));
      }
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new NetworkError('Request timeout - server did not respond within 30 seconds'));
    });
  });
}

/**
 * Sends a sitemap ping to a search engine endpoint
 * @param endpoint - The base ping endpoint URL
 * @param sitemapUrl - The sitemap URL to submit
 * @returns Promise resolving to HTTP response
 */
export async function sendPing(endpoint: string, sitemapUrl: string): Promise<HttpResponse> {
  const encodedSitemapUrl = encodeURIComponent(sitemapUrl);
  const fullUrl = `${endpoint}?sitemap=${encodedSitemapUrl}`;

  const response = await httpGet(fullUrl);

  // Validate response status
  if (response.statusCode >= 500) {
    throw new NetworkError(
      `Server error (${response.statusCode}) - the search engine service is temporarily unavailable`,
      response.statusCode
    );
  } else if (response.statusCode >= 400) {
    throw new NetworkError(
      `Client error (${response.statusCode}) - the sitemap URL may be invalid or inaccessible`,
      response.statusCode
    );
  } else if (response.statusCode !== 200) {
    throw new NetworkError(
      `Unexpected status code: ${response.statusCode}`,
      response.statusCode
    );
  }

  return response;
}
