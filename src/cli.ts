import { pingGoogle as pingGoogleApi, pingBing as pingBingApi, pingAll, ValidationError, NetworkError } from './index.js';

interface CliArgs {
  url?: string;
  google?: boolean;
  bing?: boolean;
  all?: boolean;
  help?: boolean;
  version?: boolean;
}

/**
 * Parse command-line arguments
 */
function parseArgs(args: string[]): CliArgs {
  const parsed: CliArgs = {};
  let urlFound = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (arg === '--version' || arg === '-v') {
      parsed.version = true;
    } else if (arg === '--google') {
      parsed.google = true;
    } else if (arg === '--bing') {
      parsed.bing = true;
    } else if (arg === '--all') {
      parsed.all = true;
    } else if (!arg.startsWith('-') && !urlFound) {
      parsed.url = arg;
      urlFound = true;
    }
  }

  return parsed;
}

/**
 * Display help message
 */
function showHelp(): void {
  console.log(`
seo-sitemap-ping - Submit XML sitemaps to search engines

USAGE:
  seo-sitemap-ping <sitemap-url> [options]
  npx seo-sitemap-ping <sitemap-url> [options]

OPTIONS:
  --google         Ping only Google
  --bing           Ping only Bing
  --all            Ping both Google and Bing (default)
  -h, --help       Show this help message
  -v, --version    Show version information

EXAMPLES:
  seo-sitemap-ping https://example.com/sitemap.xml
  seo-sitemap-ping https://example.com/sitemap.xml --google
  seo-sitemap-ping https://example.com/sitemap.xml --bing
  seo-sitemap-ping https://example.com/sitemap.xml --all

SUPPORTED FORMATS:
  - .xml files (standard XML sitemaps)
  - .xml.gz files (compressed sitemaps)
  - Sitemap index files

LEARN MORE:
  Visit https://www.fastseofix.com for SEO tools and tips
`);
}

/**
 * Display version information
 */
function showVersion(): void {
  // Read version from package.json dynamically in the built version
  console.log('seo-sitemap-ping version 1.0.0');
  console.log('https://www.fastseofix.com');
}

/**
 * Main CLI function
 */
export async function main(args: string[]): Promise<number> {
  const parsed = parseArgs(args);

  // Handle --help
  if (parsed.help) {
    showHelp();
    return 0;
  }

  // Handle --version
  if (parsed.version) {
    showVersion();
    return 0;
  }

  // Validate URL is provided
  if (!parsed.url) {
    console.error('Error: Sitemap URL is required\n');
    console.error('Usage: seo-sitemap-ping <sitemap-url> [options]');
    console.error('Run "seo-sitemap-ping --help" for more information');
    return 1;
  }

  // Determine which service to ping
  const shouldPingGoogle = parsed.google || (!parsed.bing && !parsed.all);
  const shouldPingBing = parsed.bing || (!parsed.google && !parsed.all);
  const pingBoth = parsed.all || (!parsed.google && !parsed.bing);

  try {
    if (pingBoth) {
      console.log(`Pinging search engines with sitemap: ${parsed.url}\n`);

      const result = await pingAll(parsed.url);

      // Display Google result
      if (result.google.success) {
        console.log(`✓ Google: Successfully pinged (${result.google.statusCode})`);
      } else {
        console.error(`✗ Google: Failed - ${result.google.error}`);
      }

      // Display Bing result
      if (result.bing.success) {
        console.log(`✓ Bing: Successfully pinged (${result.bing.statusCode})`);
      } else {
        console.error(`✗ Bing: Failed - ${result.bing.error}`);
      }

      // Exit with error if any failed
      const anyFailed = !result.google.success || !result.bing.success;
      if (anyFailed) {
        console.error('\nSome pings failed. Check the errors above.');
        return 1;
      }

      console.log('\nAll pings completed successfully!');
      return 0;
    } else if (shouldPingGoogle && !shouldPingBing) {
      console.log(`Pinging Google with sitemap: ${parsed.url}\n`);

      const result = await pingGoogleApi(parsed.url);

      console.log(`✓ Google: Successfully pinged (${result.statusCode})`);
      console.log('\nPing completed successfully!');
      return 0;
    } else if (shouldPingBing && !shouldPingGoogle) {
      console.log(`Pinging Bing with sitemap: ${parsed.url}\n`);

      const result = await pingBingApi(parsed.url);

      console.log(`✓ Bing: Successfully pinged (${result.statusCode})`);
      console.log('\nPing completed successfully!');
      return 0;
    }

    return 0;
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`Validation Error: ${error.message}`);
      console.error('\nPlease provide a valid HTTP/HTTPS sitemap URL');
      return 1;
    } else if (error instanceof NetworkError) {
      console.error(`Network Error: ${error.message}`);
      if (error.statusCode) {
        console.error(`Status Code: ${error.statusCode}`);
      }
      return 1;
    } else {
      console.error(`Unexpected Error: ${(error as Error).message}`);
      return 1;
    }
  }
}

// CLI is executed via bin/sitemap-ping.js, not directly from this file
