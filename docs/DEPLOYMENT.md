# Documentation Deployment Guide

This guide explains how to deploy the ScriptIt documentation site.

## Overview

The documentation is built with [VitePress](https://vitepress.dev/) and can be deployed to any static hosting service.

## Local Development

```bash
# Install dependencies
bun install

# Start development server
bun run docs:dev

# Build for production
bun run docs:build

# Preview production build
bun run docs:preview
```

## Deployment Options

### GitHub Pages

1. **Setup GitHub Actions** (recommended):

Create `.github/workflows/docs.yml`:

```yaml
name: Deploy Documentation

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Install dependencies
        run: bun install

      - name: Build documentation
        run: bun run docs:build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. **Enable GitHub Pages** in repository settings:
   - Go to Settings > Pages
   - Source: GitHub Actions

### Netlify

1. **Connect repository** to Netlify
2. **Build settings**:
   - Build command: `bun run docs:build`
   - Publish directory: `docs/.vitepress/dist`
3. **Environment variables**:
   - `NODE_VERSION`: `18`

### Vercel

1. **Connect repository** to Vercel
2. **Build settings**:
   - Framework Preset: Other
   - Build Command: `bun run docs:build`
   - Output Directory: `docs/.vitepress/dist`
   - Install Command: `bun install`

### Cloudflare Pages

1. **Connect repository** to Cloudflare Pages
2. **Build settings**:
   - Build command: `bun run docs:build`
   - Build output directory: `docs/.vitepress/dist`
   - Environment variables:
     - `NODE_VERSION`: `18`

## Custom Domain

To use a custom domain:

1. **Add CNAME file** in `docs/public/CNAME`:
   ```
   docs.scriptit.dev
   ```

2. **Configure DNS** to point to your hosting provider

3. **Update base URL** in `docs/.vitepress/config.ts` if needed:
   ```typescript
   export default defineConfig({
     base: '/', // or '/subdirectory/' if deploying to a subdirectory
     // ... other config
   })
   ```

## Build Optimization

### Performance Tips

1. **Enable compression** in hosting provider
2. **Use CDN** for faster global delivery
3. **Optimize images** in `docs/public/`
4. **Enable caching** for static assets

### SEO Optimization

1. **Update meta tags** in `docs/.vitepress/config.ts`
2. **Add sitemap** (VitePress generates automatically)
3. **Submit to search engines**
4. **Add structured data** if needed

## Monitoring

### Analytics

Add analytics to `docs/.vitepress/config.ts`:

```typescript
export default defineConfig({
  head: [
    // Google Analytics
    ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID' }],
    ['script', {}, `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'GA_MEASUREMENT_ID');`]
  ],
  // ... other config
})
```

### Error Monitoring

Consider adding error monitoring services like:
- Sentry
- LogRocket
- Bugsnag

## Maintenance

### Regular Tasks

1. **Update dependencies**:
   ```bash
   bun update
   ```

2. **Check for broken links**:
   ```bash
   # Remove ignoreDeadLinks from config temporarily
   bun run docs:build
   ```

3. **Update content**:
   - Version numbers in examples
   - Screenshots if UI changes
   - API documentation
   - Changelog

4. **Performance audit**:
   - Lighthouse scores
   - Bundle size analysis
   - Loading times

### Version Updates

When releasing a new ScriptIt version:

1. Update version in `docs/.vitepress/config.ts`
2. Update changelog
3. Update examples with new features
4. Add migration guides if needed
5. Update homepage features

## Troubleshooting

### Common Issues

1. **Build fails with dead links**:
   - Check all internal links
   - Temporarily enable `ignoreDeadLinks: true`

2. **Images not loading**:
   - Ensure images are in `docs/public/`
   - Use absolute paths: `/image.png`

3. **Styles not applying**:
   - Check CSS syntax
   - Verify custom CSS imports

4. **Search not working**:
   - Ensure `search.provider: 'local'` is set
   - Check if content is being indexed

### Debug Mode

Enable debug mode for troubleshooting:

```bash
DEBUG=vitepress:* bun run docs:build
```

## Support

For deployment issues:

- 📖 [VitePress Documentation](https://vitepress.dev/)
- 🐛 [Report Issues](https://github.com/glyphtek/scriptit/issues)
- 💬 [Join Discussions](https://github.com/glyphtek/scriptit/discussions) 