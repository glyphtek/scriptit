import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'ScriptIt',
  description: 'A cross-runtime CLI and library for running scripts with environment management, TUI, and colored console output',
  
  // GitHub Pages base URL (update if your repo name is different)
  base: '/scriptit/',
  
  // Ignore dead links during development
  ignoreDeadLinks: true,
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'ScriptIt | Cross-Runtime Script Runner' }],
    ['meta', { property: 'og:site_name', content: 'ScriptIt' }],
    ['meta', { property: 'og:image', content: 'https://scriptit.github.io/og-image.png' }],
    ['meta', { property: 'og:url', content: 'https://scriptit.github.io/' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/getting-started' },
      { text: 'CLI', link: '/cli/commands' },
      { text: 'Library', link: '/library/api' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'v0.7.1',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Contributing', link: '/contributing' },
        ]
      }
    ],

    sidebar: {
      '/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is ScriptIt?', link: '/introduction' },
            { text: 'Getting Started', link: '/getting-started' },
            { text: 'Installation', link: '/installation' },
          ]
        },
        {
          text: 'CLI Usage',
          items: [
            { text: 'Commands', link: '/cli/commands' },
            { text: 'Configuration', link: '/cli/configuration' },
            { text: 'Environment Variables', link: '/cli/environment' },
            { text: 'Runtime Selection', link: '/cli/runtime' },
          ]
        },
        {
          text: 'Library API',
          items: [
            { text: 'API Reference', link: '/library/api' },
            { text: 'TypeScript Types', link: '/library/types' },
            { text: 'Event System', link: '/library/events' },
          ]
        },
        {
          text: 'Features',
          items: [
            { text: 'Colored Console Output', link: '/features/console-colors' },
            { text: 'Terminal UI (TUI)', link: '/features/tui' },
            { text: 'Cross-Runtime Support', link: '/features/cross-runtime' },
            { text: 'Lambda Functions', link: '/features/lambda' },
          ]
        },
        {
          text: 'Guides',
          items: [
            { text: 'Writing Scripts', link: '/guides/writing-scripts' },
            { text: 'TypeScript Support', link: '/guides/typescript' },
            { text: 'Best Practices', link: '/guides/best-practices' },
            { text: 'Architecture Guide', link: '/guides/architecture' },
            { text: 'Migration Guide', link: '/guides/migration' },
          ]
        },
        {
          text: 'Examples',
          items: [
            { text: 'Basic Examples', link: '/examples/' },
            { text: 'CLI Examples', link: '/examples/cli' },
            { text: 'Library Examples', link: '/examples/library' },
            { text: 'Real-World Use Cases', link: '/examples/use-cases' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/glyphtek/scriptit' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@glyphtek/scriptit' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Sergio Romano'
    },

    editLink: {
      pattern: 'https://github.com/glyphtek/scriptit/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    search: {
      provider: 'local'
    },

    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  },

  vite: {
    define: {
      __VUE_OPTIONS_API__: false
    }
  }
}) 