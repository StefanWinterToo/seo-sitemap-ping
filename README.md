# sitemap-ping

[![npm version](https://badge.fury.io/js/sitemap-ping.svg)](https://www.npmjs.com/package/sitemap-ping)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Lightweight NPM package to submit XML sitemaps to Google and Bing search engines. Notify search engines when you publish new content or update existing pages to get indexed faster.

**Brought to you by [FastSEOFix.com](https://www.fastseofix.com) - Your go-to resource for SEO tools and tips.**

## Features

- Submit sitemaps to Google and Bing with simple API calls
- Concurrent ping support for faster execution
- Full TypeScript support with type definitions
- Works in both ESM and CommonJS environments
- Zero dependencies (uses Node.js built-in modules)
- Comprehensive URL validation and error handling
- CLI tool for easy command-line usage
- Supports standard XML sitemaps, compressed (.xml.gz), and sitemap index files

## Installation

```bash
npm install sitemap-ping
```

Or use without installation via npx:

```bash
npx sitemap-ping https://example.com/sitemap.xml
```

## Usage

### Programmatic API

#### ESM (ES Modules)

```typescript
import { pingGoogle, pingBing, pingAll } from 'sitemap-ping';

// Ping Google only
try {
  const result = await pingGoogle('https://www.fastseofix.com/sitemap.xml');
  console.log('Google ping successful:', result);
} catch (error) {
  console.error('Google ping failed:', error.message);
}

// Ping Bing only
try {
  const result = await pingBing('https://www.fastseofix.com/sitemap.xml');
  console.log('Bing ping successful:', result);
} catch (error) {
  console.error('Bing ping failed:', error.message);
}

// Ping both Google and Bing concurrently
const result = await pingAll('https://www.fastseofix.com/sitemap.xml');
console.log('Google:', result.google);
console.log('Bing:', result.bing);
```

#### CommonJS

```javascript
const { pingGoogle, pingBing, pingAll } = require('sitemap-ping');

// Ping both services
pingAll('https://www.fastseofix.com/sitemap.xml')
  .then(result => {
    console.log('Google:', result.google);
    console.log('Bing:', result.bing);
  })
  .catch(error => {
    console.error('Ping failed:', error.message);
  });
```

### CLI Usage

```bash
# Ping both Google and Bing (default)
sitemap-ping https://www.fastseofix.com/sitemap.xml

# Ping only Google
sitemap-ping https://www.fastseofix.com/sitemap.xml --google

# Ping only Bing
sitemap-ping https://www.fastseofix.com/sitemap.xml --bing

# Explicitly ping both
sitemap-ping https://www.fastseofix.com/sitemap.xml --all

# Show help
sitemap-ping --help

# Show version
sitemap-ping --version
```

## API Reference

### `pingGoogle(sitemapUrl: string): Promise<PingResponse>`

Submits a sitemap to Google's ping endpoint.

**Parameters:**
- `sitemapUrl` - The full URL of your sitemap (must be HTTP or HTTPS)

**Returns:** Promise resolving to `PingResponse`

**Throws:**
- `ValidationError` - If the URL is invalid
- `NetworkError` - If the network request fails

### `pingBing(sitemapUrl: string): Promise<PingResponse>`

Submits a sitemap to Bing's ping endpoint.

**Parameters:**
- `sitemapUrl` - The full URL of your sitemap (must be HTTP or HTTPS)

**Returns:** Promise resolving to `PingResponse`

**Throws:**
- `ValidationError` - If the URL is invalid
- `NetworkError` - If the network request fails

### `pingAll(sitemapUrl: string): Promise<PingAllResponse>`

Submits a sitemap to both Google and Bing concurrently.

**Parameters:**
- `sitemapUrl` - The full URL of your sitemap (must be HTTP or HTTPS)

**Returns:** Promise resolving to `PingAllResponse` containing results from both services

**Throws:**
- `ValidationError` - If the URL is invalid

**Note:** `pingAll()` uses `Promise.allSettled()`, so partial failures are handled gracefully. Check the `success` field in each response.

### Response Types

```typescript
interface PingResponse {
  success: boolean;           // Whether the ping was successful
  service: 'google' | 'bing'; // The search engine that was pinged
  statusCode?: number;        // HTTP status code
  timestamp: string;          // ISO 8601 timestamp
  error?: string;             // Error message if failed
  sitemapUrl: string;         // The sitemap URL that was submitted
}

interface PingAllResponse {
  google: PingResponse;
  bing: PingResponse;
}
```

## Error Handling

The package provides two custom error types:

### `ValidationError`

Thrown when the sitemap URL fails validation. Common reasons:
- Invalid URL format
- Non-HTTP/HTTPS protocol
- Localhost or private IP addresses (security protection)
- Empty or missing URL

### `NetworkError`

Thrown when the HTTP request fails. Includes:
- Network timeouts (30-second limit)
- DNS resolution failures
- Connection errors
- HTTP 4xx/5xx responses

### Example Error Handling

```typescript
import { pingGoogle, ValidationError, NetworkError } from 'sitemap-ping';

try {
  const result = await pingGoogle('https://example.com/sitemap.xml');
  console.log('Success!', result);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid URL:', error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Supported Sitemap Formats

- **Standard XML sitemaps** - `sitemap.xml`
- **Compressed sitemaps** - `sitemap.xml.gz`
- **Sitemap index files** - Files that reference multiple sitemaps
- **Any valid URL** - The package validates URLs but is lenient about file extensions

## Security Features

The package includes built-in security protections:

- **SSRF Protection** - Blocks localhost, private IPs, and local network addresses
- **Protocol Validation** - Only allows HTTP and HTTPS protocols
- **URL Sanitization** - Proper encoding of sitemap URLs
- **No Code Execution** - Does not execute arbitrary code from URLs

## Requirements

- Node.js >= 16.0.0
- No external dependencies

## How It Works

The package sends HTTP GET requests to the official ping endpoints:

- **Google:** `http://www.google.com/ping?sitemap={URL}`
- **Bing:** `http://www.bing.com/ping?sitemap={URL}`

A successful ping returns a 200 status code. Search engines will then crawl your sitemap to discover or update indexed content.

## When to Use

Ping search engines when you:
- Publish new content or pages
- Update existing pages
- Add or modify product listings
- Publish blog posts or articles
- Update your sitemap with new URLs

**Note:** Pinging does not guarantee immediate indexing. Search engines use this as a signal to crawl your sitemap, but they decide when and what to index based on their algorithms.

## Best Practices

1. **Don't over-ping** - Only ping when you have new or updated content
2. **Use sitemap index files** - For large sites with multiple sitemaps
3. **Keep sitemaps updated** - Ensure your sitemap accurately reflects your site
4. **Monitor results** - Check Google Search Console and Bing Webmaster Tools
5. **Implement error handling** - Handle network failures gracefully

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- **NPM Package:** [https://www.npmjs.com/package/sitemap-ping](https://www.npmjs.com/package/sitemap-ping)
- **FastSEOFix:** [https://www.fastseofix.com](https://www.fastseofix.com)
- **Issues:** [https://github.com/StefanWinterToo/seo-sitemap-ping/issues](https://github.com/StefanWinterToo/seo-sitemap-ping/issues)

## Related Resources

- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Sitemap Protocol](https://www.sitemaps.org/)
- [FastSEOFix - SEO Tools](https://www.fastseofix.com)

---

Made with ❤️ by [FastSEOFix](https://www.fastseofix.com)
