# ScriptIt Documentation

This directory contains the documentation for ScriptIt, built with [VitePress](https://vitepress.dev/).

## Structure

```
docs/
├── .vitepress/
│   └── config.ts          # VitePress configuration
├── features/
│   └── console-colors.md  # Colored console feature documentation
├── index.md               # Homepage
├── introduction.md        # What is ScriptIt?
├── getting-started.md     # Getting started guide
├── changelog.md           # Version history
└── README.md             # This file
```

## Development

### Prerequisites

- Bun (recommended) or Node.js
- VitePress installed as a dev dependency

### Running the Documentation Site

```bash
# Start development server
bun run docs:dev

# Build for production
bun run docs:build

# Preview production build
bun run docs:preview
```

The development server will start at `http://localhost:5173`.

## Contributing to Documentation

### Adding New Pages

1. Create a new `.md` file in the appropriate directory
2. Add the page to the sidebar configuration in `.vitepress/config.ts`
3. Use proper markdown formatting and VitePress features

### Writing Guidelines

- Use clear, concise language
- Include code examples where relevant
- Use proper heading hierarchy (H1 for page title, H2 for main sections, etc.)
- Include cross-references to related pages
- Test all code examples

### VitePress Features

This documentation uses several VitePress features:

#### Code Groups
```markdown
::: code-group

```bash [Bun]
bun add @glyphtek/scriptit
```

```bash [npm]
npm install @glyphtek/scriptit
```

:::
```

#### Custom Containers
```markdown
::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger
This is a danger notice
:::
```

#### Code Highlighting
Use language-specific syntax highlighting:

```markdown
```typescript
import { createScriptRunner } from '@glyphtek/scriptit'
```
```

### Updating Navigation

To add new pages to the navigation:

1. Edit `.vitepress/config.ts`
2. Add entries to the `nav` array for top-level navigation
3. Add entries to the `sidebar` object for sidebar navigation

Example:
```typescript
sidebar: {
  '/': [
    {
      text: 'New Section',
      items: [
        { text: 'New Page', link: '/new-page' }
      ]
    }
  ]
}
```

## Deployment

The documentation can be deployed to any static hosting service:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

Build the documentation with:
```bash
bun run docs:build
```

The built files will be in `docs/.vitepress/dist/`.

## Style Guide

### Headings
- Use sentence case for headings
- Don't skip heading levels
- Use descriptive headings

### Code Examples
- Always test code examples
- Include necessary imports
- Use realistic examples
- Add comments for clarity

### Links
- Use relative links for internal pages
- Use descriptive link text
- Verify all links work

### Images
- Store images in `docs/public/`
- Use descriptive alt text
- Optimize image sizes

## Maintenance

### Regular Tasks
- Update version numbers in examples
- Verify all links work
- Test code examples
- Update screenshots if UI changes
- Review and update outdated content

### Version Updates
When releasing a new version:
1. Update the changelog
2. Update version numbers in examples
3. Add migration guides if needed
4. Update the homepage features if new functionality is added 