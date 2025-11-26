import { httpGet, sendPing } from '../src/client';
import { NetworkError } from '../src/types';
import * as http from 'http';

// Mock HTTP modules
jest.mock('http');
jest.mock('https');

describe('httpGet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make successful HTTP request', async () => {
    const mockResponse = {
      statusCode: 200,
      on: jest.fn((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from('OK'));
        } else if (event === 'end') {
          callback();
        }
      }),
    };

    const mockRequest = {
      on: jest.fn(),
    };

    (http.get as jest.Mock).mockImplementation((_url, _options, callback) => {
      callback(mockResponse);
      return mockRequest;
    });

    const result = await httpGet('http://example.com/test');

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe('OK');
  });

  it('should handle network errors', async () => {
    const mockRequest = {
      on: jest.fn((event, callback) => {
        if (event === 'error') {
          callback(new Error('Network error'));
        }
      }),
    };

    (http.get as jest.Mock).mockImplementation(() => mockRequest);

    await expect(httpGet('http://example.com/test')).rejects.toThrow(NetworkError);
  });

  it('should handle timeout errors', async () => {
    const mockRequest = {
      on: jest.fn((event, callback) => {
        if (event === 'error') {
          const error: any = new Error('Timeout');
          error.code = 'ETIMEDOUT';
          callback(error);
        }
      }),
      destroy: jest.fn(),
    };

    (http.get as jest.Mock).mockImplementation(() => mockRequest);

    await expect(httpGet('http://example.com/test')).rejects.toThrow('Request timeout');
  });

  it('should handle DNS resolution failures', async () => {
    const mockRequest = {
      on: jest.fn((event, callback) => {
        if (event === 'error') {
          const error: any = new Error('DNS failed');
          error.code = 'ENOTFOUND';
          callback(error);
        }
      }),
    };

    (http.get as jest.Mock).mockImplementation(() => mockRequest);

    await expect(httpGet('http://example.com/test')).rejects.toThrow('DNS resolution failed');
  });
});

describe('sendPing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send ping with encoded URL', async () => {
    const mockResponse = {
      statusCode: 200,
      on: jest.fn((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from('OK'));
        } else if (event === 'end') {
          callback();
        }
      }),
    };

    const mockRequest = {
      on: jest.fn(),
    };

    (http.get as jest.Mock).mockImplementation((url, _options, callback) => {
      expect(url).toContain('sitemap=');
      expect(url).toContain(encodeURIComponent('https://example.com/sitemap.xml'));
      callback(mockResponse);
      return mockRequest;
    });

    const result = await sendPing('http://google.com/ping', 'https://example.com/sitemap.xml');

    expect(result.statusCode).toBe(200);
  });

  it('should handle 4xx errors', async () => {
    const mockResponse = {
      statusCode: 404,
      on: jest.fn((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from('Not Found'));
        } else if (event === 'end') {
          callback();
        }
      }),
    };

    const mockRequest = {
      on: jest.fn(),
    };

    (http.get as jest.Mock).mockImplementation((_url, _options, callback) => {
      callback(mockResponse);
      return mockRequest;
    });

    await expect(sendPing('http://google.com/ping', 'https://example.com/sitemap.xml')).rejects.toThrow(
      NetworkError
    );
    await expect(sendPing('http://google.com/ping', 'https://example.com/sitemap.xml')).rejects.toThrow(
      'Client error (404)'
    );
  });

  it('should handle 5xx errors', async () => {
    const mockResponse = {
      statusCode: 500,
      on: jest.fn((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from('Server Error'));
        } else if (event === 'end') {
          callback();
        }
      }),
    };

    const mockRequest = {
      on: jest.fn(),
    };

    (http.get as jest.Mock).mockImplementation((_url, _options, callback) => {
      callback(mockResponse);
      return mockRequest;
    });

    await expect(sendPing('http://google.com/ping', 'https://example.com/sitemap.xml')).rejects.toThrow(
      'Server error (500)'
    );
  });
});
