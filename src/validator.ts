import { ValidationError } from './types.js';

/**
 * Validates that a URL is a valid HTTP/HTTPS sitemap URL
 * @param url - The URL to validate
 * @throws {ValidationError} If the URL is invalid
 */
export function validateSitemapUrl(url: string): void {
  if (!url || typeof url !== 'string') {
    throw new ValidationError('Sitemap URL must be a non-empty string');
  }

  // Trim whitespace
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    throw new ValidationError('Sitemap URL cannot be empty');
  }

  // Parse URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmedUrl);
  } catch (error) {
    throw new ValidationError(`Invalid URL format: ${trimmedUrl}`);
  }

  // Validate protocol
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new ValidationError(
      `URL must use HTTP or HTTPS protocol, got: ${parsedUrl.protocol}`
    );
  }

  // Validate hostname exists
  if (!parsedUrl.hostname) {
    throw new ValidationError('URL must have a valid hostname');
  }

  // Prevent localhost and private IPs (SSRF protection)
  const hostname = parsedUrl.hostname.toLowerCase();

  // Check for localhost
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.startsWith('127.') ||
    hostname.endsWith('.local')
  ) {
    throw new ValidationError('Localhost URLs are not allowed');
  }

  // Check for private IP ranges
  const privateIpPatterns = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./, // Link-local
    /^fc00:/i, // IPv6 private
    /^fd00:/i, // IPv6 private
  ];

  if (privateIpPatterns.some(pattern => pattern.test(hostname))) {
    throw new ValidationError('Private IP addresses are not allowed');
  }

  // Validate path looks like a sitemap (optional, lenient)
  const pathname = parsedUrl.pathname.toLowerCase();
  const validExtensions = ['.xml', '.xml.gz', '.txt'];
  const hasValidExtension = validExtensions.some(ext => pathname.endsWith(ext));

  // Warn but don't reject if no valid extension (some sitemaps might not have extensions)
  if (pathname && !hasValidExtension && pathname !== '/') {
    // Still allow it, just make sure it's not obviously wrong
    // This is lenient to support various sitemap configurations
  }
}

/**
 * Normalizes and encodes a sitemap URL for submission
 * @param url - The URL to normalize
 * @returns The normalized URL string
 */
export function normalizeSitemapUrl(url: string): string {
  const trimmedUrl = url.trim();
  // URL encoding will be handled by the HTTP client
  return trimmedUrl;
}
