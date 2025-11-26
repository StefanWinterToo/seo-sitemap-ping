/**
 * Response from a sitemap ping operation
 */
export interface PingResponse {
  /** Whether the ping was successful */
  success: boolean;
  /** The search engine that was pinged */
  service: 'google' | 'bing';
  /** HTTP status code from the ping endpoint */
  statusCode?: number;
  /** Timestamp of when the ping was sent */
  timestamp: string;
  /** Error message if the ping failed */
  error?: string;
  /** The sitemap URL that was submitted */
  sitemapUrl: string;
}

/**
 * Response from pinging all services
 */
export interface PingAllResponse {
  /** Response from Google ping */
  google: PingResponse;
  /** Response from Bing ping */
  bing: PingResponse;
}

/**
 * Error thrown when URL validation fails
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error thrown when network request fails
 */
export class NetworkError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}
