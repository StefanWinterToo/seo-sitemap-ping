import { validateSitemapUrl, normalizeSitemapUrl } from './validator.js';
import { sendPing } from './client.js';
import { PingResponse, PingAllResponse, ValidationError, NetworkError } from './types.js';

// Export types
export { PingResponse, PingAllResponse, ValidationError, NetworkError };

// Search engine ping endpoints
const GOOGLE_PING_ENDPOINT = 'http://www.google.com/ping';
const BING_PING_ENDPOINT = 'http://www.bing.com/ping';

/**
 * Creates a PingResponse object
 */
function createPingResponse(
  service: 'google' | 'bing',
  sitemapUrl: string,
  success: boolean,
  statusCode?: number,
  error?: string
): PingResponse {
  return {
    success,
    service,
    statusCode,
    timestamp: new Date().toISOString(),
    error,
    sitemapUrl,
  };
}

/**
 * Pings Google's sitemap submission endpoint
 * @param sitemapUrl - The URL of the sitemap to submit
 * @returns Promise resolving to ping response
 * @throws {ValidationError} If the sitemap URL is invalid
 * @throws {NetworkError} If the network request fails
 *
 * @example
 * ```typescript
 * import { pingGoogle } from 'sitemap-ping';
 *
 * try {
 *   const result = await pingGoogle('https://example.com/sitemap.xml');
 *   console.log('Google ping successful:', result);
 * } catch (error) {
 *   console.error('Google ping failed:', error);
 * }
 * ```
 */
export async function pingGoogle(sitemapUrl: string): Promise<PingResponse> {
  // Validate URL
  validateSitemapUrl(sitemapUrl);

  // Normalize URL
  const normalizedUrl = normalizeSitemapUrl(sitemapUrl);

  try {
    // Send ping
    const response = await sendPing(GOOGLE_PING_ENDPOINT, normalizedUrl);

    return createPingResponse('google', normalizedUrl, true, response.statusCode);
  } catch (error) {
    if (error instanceof NetworkError || error instanceof ValidationError) {
      throw error;
    }
    throw new NetworkError(`Unexpected error: ${(error as Error).message}`);
  }
}

/**
 * Pings Bing's sitemap submission endpoint
 * @param sitemapUrl - The URL of the sitemap to submit
 * @returns Promise resolving to ping response
 * @throws {ValidationError} If the sitemap URL is invalid
 * @throws {NetworkError} If the network request fails
 *
 * @example
 * ```typescript
 * import { pingBing } from 'sitemap-ping';
 *
 * try {
 *   const result = await pingBing('https://example.com/sitemap.xml');
 *   console.log('Bing ping successful:', result);
 * } catch (error) {
 *   console.error('Bing ping failed:', error);
 * }
 * ```
 */
export async function pingBing(sitemapUrl: string): Promise<PingResponse> {
  // Validate URL
  validateSitemapUrl(sitemapUrl);

  // Normalize URL
  const normalizedUrl = normalizeSitemapUrl(sitemapUrl);

  try {
    // Send ping
    const response = await sendPing(BING_PING_ENDPOINT, normalizedUrl);

    return createPingResponse('bing', normalizedUrl, true, response.statusCode);
  } catch (error) {
    if (error instanceof NetworkError || error instanceof ValidationError) {
      throw error;
    }
    throw new NetworkError(`Unexpected error: ${(error as Error).message}`);
  }
}

/**
 * Pings both Google and Bing sitemap submission endpoints concurrently
 * @param sitemapUrl - The URL of the sitemap to submit
 * @returns Promise resolving to ping responses from both services
 * @throws {ValidationError} If the sitemap URL is invalid
 *
 * @example
 * ```typescript
 * import { pingAll } from 'sitemap-ping';
 *
 * const result = await pingAll('https://example.com/sitemap.xml');
 * console.log('Google:', result.google);
 * console.log('Bing:', result.bing);
 * ```
 */
export async function pingAll(sitemapUrl: string): Promise<PingAllResponse> {
  // Validate URL once before sending to both services
  validateSitemapUrl(sitemapUrl);

  // Normalize URL
  const normalizedUrl = normalizeSitemapUrl(sitemapUrl);

  // Send pings concurrently
  const results = await Promise.allSettled([
    pingGoogle(normalizedUrl),
    pingBing(normalizedUrl),
  ]);

  // Process Google result
  const googleResult = results[0];
  const googleResponse: PingResponse =
    googleResult.status === 'fulfilled'
      ? googleResult.value
      : createPingResponse(
          'google',
          normalizedUrl,
          false,
          undefined,
          googleResult.reason?.message || 'Unknown error'
        );

  // Process Bing result
  const bingResult = results[1];
  const bingResponse: PingResponse =
    bingResult.status === 'fulfilled'
      ? bingResult.value
      : createPingResponse(
          'bing',
          normalizedUrl,
          false,
          undefined,
          bingResult.reason?.message || 'Unknown error'
        );

  return {
    google: googleResponse,
    bing: bingResponse,
  };
}
