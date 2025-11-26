import { main } from '../src/cli';
import * as api from '../src/index';

// Mock the API module
jest.mock('../src/index');

const mockPingGoogle = api.pingGoogle as jest.MockedFunction<typeof api.pingGoogle>;
const mockPingBing = api.pingBing as jest.MockedFunction<typeof api.pingBing>;
const mockPingAll = api.pingAll as jest.MockedFunction<typeof api.pingAll>;

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('CLI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('help and version', () => {
    it('should show help with --help flag', async () => {
      const exitCode = await main(['--help']);

      expect(exitCode).toBe(0);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('USAGE:'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('sitemap-ping'));
    });

    it('should show version with --version flag', async () => {
      const exitCode = await main(['--version']);

      expect(exitCode).toBe(0);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('version'));
    });
  });

  describe('URL validation', () => {
    it('should error when no URL is provided', async () => {
      const exitCode = await main([]);

      expect(exitCode).toBe(1);
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('URL is required'));
    });
  });

  describe('ping operations', () => {
    it('should ping both services by default', async () => {
      mockPingAll.mockResolvedValue({
        google: {
          success: true,
          service: 'google',
          statusCode: 200,
          timestamp: new Date().toISOString(),
          sitemapUrl: 'https://example.com/sitemap.xml',
        },
        bing: {
          success: true,
          service: 'bing',
          statusCode: 200,
          timestamp: new Date().toISOString(),
          sitemapUrl: 'https://example.com/sitemap.xml',
        },
      });

      const exitCode = await main(['https://example.com/sitemap.xml']);

      expect(exitCode).toBe(0);
      expect(mockPingAll).toHaveBeenCalledWith('https://example.com/sitemap.xml');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Google'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Bing'));
    });

    it('should ping only Google with --google flag', async () => {
      mockPingGoogle.mockResolvedValue({
        success: true,
        service: 'google',
        statusCode: 200,
        timestamp: new Date().toISOString(),
        sitemapUrl: 'https://example.com/sitemap.xml',
      });

      const exitCode = await main(['https://example.com/sitemap.xml', '--google']);

      expect(exitCode).toBe(0);
      expect(mockPingGoogle).toHaveBeenCalledWith('https://example.com/sitemap.xml');
      expect(mockPingBing).not.toHaveBeenCalled();
      expect(mockPingAll).not.toHaveBeenCalled();
    });

    it('should ping only Bing with --bing flag', async () => {
      mockPingBing.mockResolvedValue({
        success: true,
        service: 'bing',
        statusCode: 200,
        timestamp: new Date().toISOString(),
        sitemapUrl: 'https://example.com/sitemap.xml',
      });

      const exitCode = await main(['https://example.com/sitemap.xml', '--bing']);

      expect(exitCode).toBe(0);
      expect(mockPingBing).toHaveBeenCalledWith('https://example.com/sitemap.xml');
      expect(mockPingGoogle).not.toHaveBeenCalled();
      expect(mockPingAll).not.toHaveBeenCalled();
    });

    it('should ping both services with --all flag', async () => {
      mockPingAll.mockResolvedValue({
        google: {
          success: true,
          service: 'google',
          statusCode: 200,
          timestamp: new Date().toISOString(),
          sitemapUrl: 'https://example.com/sitemap.xml',
        },
        bing: {
          success: true,
          service: 'bing',
          statusCode: 200,
          timestamp: new Date().toISOString(),
          sitemapUrl: 'https://example.com/sitemap.xml',
        },
      });

      const exitCode = await main(['https://example.com/sitemap.xml', '--all']);

      expect(exitCode).toBe(0);
      expect(mockPingAll).toHaveBeenCalledWith('https://example.com/sitemap.xml');
    });
  });

  describe('error handling', () => {
    it('should handle validation errors', async () => {
      mockPingAll.mockRejectedValue(new api.ValidationError('Invalid URL'));

      const exitCode = await main(['invalid-url']);

      expect(exitCode).toBe(1);
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Validation Error'));
    });

    it('should handle network errors', async () => {
      mockPingAll.mockRejectedValue(new api.NetworkError('Network failure', 500));

      const exitCode = await main(['https://example.com/sitemap.xml']);

      expect(exitCode).toBe(1);
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Network Error'));
    });

    it('should handle partial failures', async () => {
      mockPingAll.mockResolvedValue({
        google: {
          success: true,
          service: 'google',
          statusCode: 200,
          timestamp: new Date().toISOString(),
          sitemapUrl: 'https://example.com/sitemap.xml',
        },
        bing: {
          success: false,
          service: 'bing',
          error: 'Failed to connect',
          timestamp: new Date().toISOString(),
          sitemapUrl: 'https://example.com/sitemap.xml',
        },
      });

      const exitCode = await main(['https://example.com/sitemap.xml']);

      expect(exitCode).toBe(1);
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Bing: Failed'));
    });
  });
});
