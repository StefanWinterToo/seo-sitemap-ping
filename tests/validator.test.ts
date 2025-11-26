import { validateSitemapUrl, normalizeSitemapUrl } from '../src/validator';
import { ValidationError } from '../src/types';

describe('validateSitemapUrl', () => {
  describe('valid URLs', () => {
    it('should accept valid HTTP sitemap URL', () => {
      expect(() => validateSitemapUrl('http://example.com/sitemap.xml')).not.toThrow();
    });

    it('should accept valid HTTPS sitemap URL', () => {
      expect(() => validateSitemapUrl('https://example.com/sitemap.xml')).not.toThrow();
    });

    it('should accept .xml.gz URLs', () => {
      expect(() => validateSitemapUrl('https://example.com/sitemap.xml.gz')).not.toThrow();
    });

    it('should accept sitemap index files', () => {
      expect(() => validateSitemapUrl('https://example.com/sitemap_index.xml')).not.toThrow();
    });

    it('should accept URLs with paths', () => {
      expect(() => validateSitemapUrl('https://example.com/sitemaps/main.xml')).not.toThrow();
    });

    it('should accept URLs with query parameters', () => {
      expect(() => validateSitemapUrl('https://example.com/sitemap.xml?v=1')).not.toThrow();
    });

    it('should accept URLs with ports', () => {
      expect(() => validateSitemapUrl('https://example.com:8080/sitemap.xml')).not.toThrow();
    });
  });

  describe('invalid URLs', () => {
    it('should reject empty string', () => {
      expect(() => validateSitemapUrl('')).toThrow(ValidationError);
      expect(() => validateSitemapUrl('')).toThrow('non-empty string');
    });

    it('should reject whitespace-only string', () => {
      expect(() => validateSitemapUrl('   ')).toThrow(ValidationError);
    });

    it('should reject non-string values', () => {
      expect(() => validateSitemapUrl(null as any)).toThrow(ValidationError);
      expect(() => validateSitemapUrl(undefined as any)).toThrow(ValidationError);
    });

    it('should reject invalid URL format', () => {
      expect(() => validateSitemapUrl('not-a-url')).toThrow(ValidationError);
      expect(() => validateSitemapUrl('not-a-url')).toThrow('Invalid URL format');
    });

    it('should reject FTP protocol', () => {
      expect(() => validateSitemapUrl('ftp://example.com/sitemap.xml')).toThrow(ValidationError);
      expect(() => validateSitemapUrl('ftp://example.com/sitemap.xml')).toThrow('must use HTTP or HTTPS');
    });

    it('should reject file protocol', () => {
      expect(() => validateSitemapUrl('file:///path/to/sitemap.xml')).toThrow(ValidationError);
    });

    it('should reject localhost', () => {
      expect(() => validateSitemapUrl('http://localhost/sitemap.xml')).toThrow(ValidationError);
      expect(() => validateSitemapUrl('http://localhost/sitemap.xml')).toThrow('Localhost URLs are not allowed');
    });

    it('should reject 127.0.0.1', () => {
      expect(() => validateSitemapUrl('http://127.0.0.1/sitemap.xml')).toThrow(ValidationError);
    });

    it('should reject private IP addresses', () => {
      expect(() => validateSitemapUrl('http://192.168.1.1/sitemap.xml')).toThrow(ValidationError);
      expect(() => validateSitemapUrl('http://10.0.0.1/sitemap.xml')).toThrow(ValidationError);
      expect(() => validateSitemapUrl('http://172.16.0.1/sitemap.xml')).toThrow(ValidationError);
      expect(() => validateSitemapUrl('http://192.168.1.1/sitemap.xml')).toThrow('Private IP addresses are not allowed');
    });

    it('should reject .local domains', () => {
      expect(() => validateSitemapUrl('http://myserver.local/sitemap.xml')).toThrow(ValidationError);
    });
  });

  describe('normalizeSitemapUrl', () => {
    it('should trim whitespace', () => {
      expect(normalizeSitemapUrl('  https://example.com/sitemap.xml  ')).toBe(
        'https://example.com/sitemap.xml'
      );
    });

    it('should preserve URL structure', () => {
      const url = 'https://example.com/path/sitemap.xml?v=1';
      expect(normalizeSitemapUrl(url)).toBe(url);
    });
  });
});
