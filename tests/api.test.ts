import { pingGoogle, pingBing, pingAll } from '../src/index';
import { ValidationError, NetworkError } from '../src/types';
import * as client from '../src/client';

// Mock the client module
jest.mock('../src/client');

const mockSendPing = client.sendPing as jest.MockedFunction<typeof client.sendPing>;

describe('pingGoogle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully ping Google', async () => {
    mockSendPing.mockResolvedValue({ statusCode: 200, body: 'OK' });

    const result = await pingGoogle('https://example.com/sitemap.xml');

    expect(result.success).toBe(true);
    expect(result.service).toBe('google');
    expect(result.statusCode).toBe(200);
    expect(result.sitemapUrl).toBe('https://example.com/sitemap.xml');
    expect(result.timestamp).toBeDefined();
    expect(mockSendPing).toHaveBeenCalledWith(
      'http://www.google.com/ping',
      'https://example.com/sitemap.xml'
    );
  });

  it('should throw ValidationError for invalid URL', async () => {
    await expect(pingGoogle('invalid-url')).rejects.toThrow(ValidationError);
    expect(mockSendPing).not.toHaveBeenCalled();
  });

  it('should throw NetworkError on network failure', async () => {
    mockSendPing.mockRejectedValue(new NetworkError('Network failure'));

    await expect(pingGoogle('https://example.com/sitemap.xml')).rejects.toThrow(NetworkError);
  });

  it('should reject localhost URLs', async () => {
    await expect(pingGoogle('http://localhost/sitemap.xml')).rejects.toThrow(ValidationError);
  });
});

describe('pingBing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully ping Bing', async () => {
    mockSendPing.mockResolvedValue({ statusCode: 200, body: 'OK' });

    const result = await pingBing('https://example.com/sitemap.xml');

    expect(result.success).toBe(true);
    expect(result.service).toBe('bing');
    expect(result.statusCode).toBe(200);
    expect(result.sitemapUrl).toBe('https://example.com/sitemap.xml');
    expect(mockSendPing).toHaveBeenCalledWith(
      'http://www.bing.com/ping',
      'https://example.com/sitemap.xml'
    );
  });

  it('should throw ValidationError for invalid URL', async () => {
    await expect(pingBing('invalid-url')).rejects.toThrow(ValidationError);
    expect(mockSendPing).not.toHaveBeenCalled();
  });

  it('should throw NetworkError on network failure', async () => {
    mockSendPing.mockRejectedValue(new NetworkError('Network failure'));

    await expect(pingBing('https://example.com/sitemap.xml')).rejects.toThrow(NetworkError);
  });
});

describe('pingAll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully ping both Google and Bing', async () => {
    mockSendPing.mockResolvedValue({ statusCode: 200, body: 'OK' });

    const result = await pingAll('https://example.com/sitemap.xml');

    expect(result.google.success).toBe(true);
    expect(result.google.service).toBe('google');
    expect(result.bing.success).toBe(true);
    expect(result.bing.service).toBe('bing');
    expect(mockSendPing).toHaveBeenCalledTimes(2);
  });

  it('should handle partial failures gracefully', async () => {
    mockSendPing
      .mockResolvedValueOnce({ statusCode: 200, body: 'OK' }) // Google succeeds
      .mockRejectedValueOnce(new NetworkError('Bing failed')); // Bing fails

    const result = await pingAll('https://example.com/sitemap.xml');

    expect(result.google.success).toBe(true);
    expect(result.bing.success).toBe(false);
    expect(result.bing.error).toBeDefined();
  });

  it('should handle both services failing', async () => {
    mockSendPing.mockRejectedValue(new NetworkError('Network failure'));

    const result = await pingAll('https://example.com/sitemap.xml');

    expect(result.google.success).toBe(false);
    expect(result.bing.success).toBe(false);
    expect(result.google.error).toBeDefined();
    expect(result.bing.error).toBeDefined();
  });

  it('should throw ValidationError for invalid URL', async () => {
    await expect(pingAll('invalid-url')).rejects.toThrow(ValidationError);
    expect(mockSendPing).not.toHaveBeenCalled();
  });

  it('should ping services concurrently', async () => {
    let googleStartTime = 0;
    let bingStartTime = 0;

    mockSendPing.mockImplementation((endpoint) => {
      return new Promise((resolve) => {
        const delay = 100;
        if (endpoint.includes('google')) {
          googleStartTime = Date.now();
        } else {
          bingStartTime = Date.now();
        }
        setTimeout(() => resolve({ statusCode: 200, body: 'OK' }), delay);
      });
    });

    await pingAll('https://example.com/sitemap.xml');

    // If concurrent, both should start around the same time (within 50ms)
    expect(Math.abs(googleStartTime - bingStartTime)).toBeLessThan(50);
  });
});
