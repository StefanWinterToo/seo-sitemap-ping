# Getting Started with sitemap-ping

This guide will help you publish and use your sitemap-ping NPM package.

## Package Summary

**sitemap-ping** is a lightweight NPM package that submits XML sitemaps to Google and Bing search engines to notify them of new or updated content.

### Key Features
- ✅ Submit sitemaps to Google and Bing
- ✅ Concurrent ping support for faster execution
- ✅ Full TypeScript support with type definitions
- ✅ Works in both ESM and CommonJS environments
- ✅ Zero dependencies (uses Node.js built-in modules)
- ✅ Comprehensive URL validation and SSRF protection
- ✅ CLI tool for easy command-line usage
- ✅ 93%+ test coverage with 48 passing tests

## Project Structure

```
sitemap-ping/
├── src/                    # TypeScript source files
│   ├── index.ts           # Main API exports
│   ├── types.ts           # TypeScript type definitions
│   ├── validator.ts       # URL validation
│   ├── client.ts          # HTTP client
│   └── cli.ts             # CLI implementation
├── tests/                  # Test files
│   ├── api.test.ts
│   ├── client.test.ts
│   ├── validator.test.ts
│   └── cli.test.ts
├── bin/                    # CLI executable
│   └── sitemap-ping.js
├── dist/                   # Compiled output (after build)
│   ├── cjs/               # CommonJS build
│   ├── esm/               # ES Modules build
│   └── types/             # TypeScript definitions
├── package.json
├── tsconfig.json
├── jest.config.js
├── README.md
└── LICENSE
```

## Pre-Publishing Checklist

### 1. Verify Build
```bash
npm run build
```

The build should create three directories in `dist/`:
- `cjs/` - CommonJS modules
- `esm/` - ES Modules
- `types/` - TypeScript definitions

### 2. Run Tests
```bash
npm test
```

All 48 tests should pass with 93%+ coverage.

### 3. Check Package Contents
```bash
npm pack --dry-run
```

This shows what files will be included in the published package.

### 4. Test Locally
```bash
npm link
```

Then in another project:
```bash
npm link sitemap-ping
```

Test both programmatic API and CLI:
```bash
# Test CLI
sitemap-ping https://www.fastseofix.com/sitemap.xml --all

# Test programmatic API
node -e "const {pingAll} = require('sitemap-ping'); pingAll('https://www.fastseofix.com/sitemap.xml').then(console.log)"
```

## Publishing to NPM

### First-Time Setup

1. Create an NPM account at https://www.npmjs.com/signup

2. Login via CLI:
```bash
npm login
```

3. Verify you're logged in:
```bash
npm whoami
```

### Publishing

1. Update version (if needed):
```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

2. Publish:
```bash
npm publish
```

For scoped packages (e.g., @fastseofix/sitemap-ping):
```bash
npm publish --access public
```

3. Verify publication:
```bash
npm info sitemap-ping
```

## Post-Publishing

### Test Installation

In a new directory:
```bash
npm install sitemap-ping
```

### Test with npx

```bash
npx sitemap-ping https://www.fastseofix.com/sitemap.xml
```

### Update GitHub Repository

1. Initialize git (if not already):
```bash
git init
git add .
git commit -m "Initial commit: sitemap-ping v1.0.0"
```

2. Create GitHub repository at https://github.com/new

3. Push to GitHub:
```bash
git remote add origin https://github.com/yourusername/sitemap-ping.git
git branch -M main
git push -u origin main
```

4. Update package.json with correct repository URL

5. Add GitHub badges to README (optional)

## Usage Examples

### Programmatic API (ESM)

```typescript
import { pingGoogle, pingBing, pingAll } from 'sitemap-ping';

// Ping Google
const googleResult = await pingGoogle('https://www.fastseofix.com/sitemap.xml');
console.log(googleResult);

// Ping Bing
const bingResult = await pingBing('https://www.fastseofix.com/sitemap.xml');
console.log(bingResult);

// Ping both
const allResults = await pingAll('https://www.fastseofix.com/sitemap.xml');
console.log(allResults.google);
console.log(allResults.bing);
```

### Programmatic API (CommonJS)

```javascript
const { pingAll } = require('sitemap-ping');

pingAll('https://www.fastseofix.com/sitemap.xml')
  .then(result => {
    console.log('Google:', result.google);
    console.log('Bing:', result.bing);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
```

### CLI

```bash
# Ping both (default)
sitemap-ping https://www.fastseofix.com/sitemap.xml

# Ping only Google
sitemap-ping https://www.fastseofix.com/sitemap.xml --google

# Ping only Bing
sitemap-ping https://www.fastseofix.com/sitemap.xml --bing

# Help
sitemap-ping --help

# Version
sitemap-ping --version
```

## Maintenance

### Update Dependencies

```bash
npm update
npm audit fix
```

### Add New Features

1. Write tests first (TDD approach)
2. Implement feature
3. Update documentation
4. Bump version
5. Publish

### Release Process

1. Update CHANGELOG.md with changes
2. Bump version: `npm version [patch|minor|major]`
3. Build: `npm run build`
4. Test: `npm test`
5. Publish: `npm publish`
6. Push to GitHub: `git push && git push --tags`

## Troubleshooting

### Build Fails
- Check TypeScript version compatibility
- Verify all imports use `.js` extension for ESM

### Tests Fail
- Run `npm install` to ensure dependencies are up to date
- Check Node.js version (must be >= 16)

### Package Size Too Large
- Check `.npmignore` is excluding development files
- Run `npm pack` to see included files

## Support

- **Issues**: https://github.com/fastseofix/sitemap-ping/issues
- **NPM**: https://www.npmjs.com/package/sitemap-ping
- **Website**: https://www.fastseofix.com

## License

MIT License - see LICENSE file for details.
