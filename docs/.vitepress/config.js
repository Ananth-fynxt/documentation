import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/documentation/',
  title: 'Nexxus',
  description: 'PSP Orchestration - Uniting classic payment trust with next-gen orchestration.',
  head: [
    ['link', { rel: 'icon', href: '/documentation/assets/icon.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/documentation/assets/icon.png' }]
  ],
  vite: {
    assetsInclude: ['**/*.splinecode', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg', '**/*.gif', '**/*.webp'],
    build: {
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            // Preserve directory structure for assets referenced in markdown
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico|splinecode/i.test(ext)) {
              return `assets/${assetInfo.name}`
            }
            return `assets/${assetInfo.name}`
          }
        }
      }
    }
  },
  themeConfig: {
    outline: {
      level: [2, 3],
      label: 'On this page'
    },
    logo: '/assets/icon.png',
    siteTitle: 'Nexxus',
    siteDescription: 'PSP Orchestration - Uniting classic payment trust with next-gen orchestration.',
    siteUrl: 'https://nexxus.com',
    siteKeywords: ['Nexxus', 'PSP Orchestration', 'Payment Trust', 'Next-gen Orchestration'],
    siteAuthor: 'Nexxus',
    siteCopyright: 'Copyright © 2025 Nexxus',
    siteLanguage: 'en-US',
    siteDirection: 'ltr',
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API Documentation', link: '/psp/' },
      { text: 'Backend Library', link: '/backend/' },
      { text: 'Frontend Library', link: '/frontend/' }
    ],
    sidebar: {
      '/backend/': [
        {
          text: 'Backend Library',
          items: [
            { text: 'Overview', link: '/backend/' },
            {
              text: 'DenoVM',
              items: [
                { text: 'Overview', link: '/denovm/' },
                { text: 'Quick Start', link: '/denovm/quick-start' },
                { text: 'Configuration', link: '/denovm/configuration' },
                { text: 'Execution Modes', link: '/denovm/execution-modes' },
                { text: 'Writing Scripts', link: '/denovm/writing-scripts' },
                { text: 'Request & Response', link: '/denovm/request-response' },
                { text: 'Architecture', link: '/denovm/architecture' },
                { text: 'Limitations', link: '/denovm/limitations' },
                { text: 'Troubleshooting', link: '/denovm/troubleshooting' }
              ]
            },
            {
              text: 'Flow',
              items: [
                { text: 'Overview', link: '/flow/' },
                { text: 'Quick Start', link: '/flow/quick-start' },
                { text: 'Configuration', link: '/flow/configuration' },
                { text: 'Usage Examples', link: '/flow/usage-examples' },
                { text: 'Services', link: '/flow/services' },
                { text: 'Validation', link: '/flow/validation' },
                { text: 'Best Practices', link: '/flow/best-practices' },
                { text: 'Architecture', link: '/flow/architecture' },
                { text: 'Troubleshooting', link: '/flow/troubleshooting' }
              ]
            },
            {
              text: 'JWT',
              items: [
                { text: 'Overview', link: '/jwt/' },
                { text: 'Quick Start', link: '/jwt/quick-start' },
                { text: 'Configuration', link: '/jwt/configuration' },
                { text: 'Usage Examples', link: '/jwt/usage-examples' },
                { text: 'API Reference', link: '/jwt/api-reference' },
                { text: 'Best Practices', link: '/jwt/best-practices' },
                { text: 'Architecture', link: '/jwt/architecture' },
                { text: 'Troubleshooting', link: '/jwt/troubleshooting' }
             
              ]
            }
          ]
        }
      ],
      '/denovm/': [
        {
          text: 'Backend Library',
          items: [
            { text: 'Overview', link: '/backend/' },
            {
              text: 'DenoVM',
              items: [
                { text: 'Overview', link: '/denovm/' },
                { text: 'Quick Start', link: '/denovm/quick-start' },
                { text: 'Configuration', link: '/denovm/configuration' },
                { text: 'Execution Modes', link: '/denovm/execution-modes' },
                { text: 'Writing Scripts', link: '/denovm/writing-scripts' },
                { text: 'Request & Response', link: '/denovm/request-response' },
                { text: 'Architecture', link: '/denovm/architecture' },
                { text: 'Limitations', link: '/denovm/limitations' },
                { text: 'Troubleshooting', link: '/denovm/troubleshooting' }
              ]
            },
            {
              text: 'Flow',
              items: [
                { text: 'Overview', link: '/flow/' },
                { text: 'Quick Start', link: '/flow/quick-start' },
                { text: 'Configuration', link: '/flow/configuration' },
                { text: 'Usage Examples', link: '/flow/usage-examples' },
                { text: 'Services', link: '/flow/services' },
                { text: 'Validation', link: '/flow/validation' },
                { text: 'Best Practices', link: '/flow/best-practices' },
                { text: 'Architecture', link: '/flow/architecture' },
                { text: 'Troubleshooting', link: '/flow/troubleshooting' }
              ]
            },
            {
              text: 'JWT',
              items: [
                { text: 'Overview', link: '/jwt/' },
                { text: 'Quick Start', link: '/jwt/quick-start' },
                { text: 'Configuration', link: '/jwt/configuration' },
                { text: 'Usage Examples', link: '/jwt/usage-examples' },
                { text: 'API Reference', link: '/jwt/api-reference' },
                { text: 'Best Practices', link: '/jwt/best-practices' },
                { text: 'Troubleshooting', link: '/jwt/troubleshooting' },
                { text: 'Architecture', link: '/jwt/architecture' }
              ]
            }
          ]
        }
      ],
      '/flow/': [
        {
          text: 'Backend Library',
          items: [
            { text: 'Overview', link: '/backend/' },
            {
              text: 'DenoVM',
              items: [
                { text: 'Overview', link: '/denovm/' },
                { text: 'Quick Start', link: '/denovm/quick-start' },
                { text: 'Configuration', link: '/denovm/configuration' },
                { text: 'Execution Modes', link: '/denovm/execution-modes' },
                { text: 'Writing Scripts', link: '/denovm/writing-scripts' },
                { text: 'Request & Response', link: '/denovm/request-response' },
                { text: 'Architecture', link: '/denovm/architecture' },
                { text: 'Limitations', link: '/denovm/limitations' },
                { text: 'Troubleshooting', link: '/denovm/troubleshooting' }
              ]
            },
            {
              text: 'Flow',
              items: [
                { text: 'Overview', link: '/flow/' },
                { text: 'Quick Start', link: '/flow/quick-start' },
                { text: 'Configuration', link: '/flow/configuration' },
                { text: 'Usage Examples', link: '/flow/usage-examples' },
                { text: 'Services', link: '/flow/services' },
                { text: 'Validation', link: '/flow/validation' },
                { text: 'Best Practices', link: '/flow/best-practices' },
                { text: 'Architecture', link: '/flow/architecture' },
                { text: 'Troubleshooting', link: '/flow/troubleshooting' }
              ]
            },
            {
              text: 'JWT',
              items: [
                { text: 'Overview', link: '/jwt/' },
                { text: 'Quick Start', link: '/jwt/quick-start' },
                { text: 'Configuration', link: '/jwt/configuration' },
                { text: 'Usage Examples', link: '/jwt/usage-examples' },
                { text: 'API Reference', link: '/jwt/api-reference' },
                { text: 'Best Practices', link: '/jwt/best-practices' },
                { text: 'Troubleshooting', link: '/jwt/troubleshooting' },
                { text: 'Architecture', link: '/jwt/architecture' }
              ]
            }
          ]
        }
      ],
      '/jwt/': [
        {
          text: 'Backend Library',
          items: [
            { text: 'Overview', link: '/backend/' },
            {
              text: 'DenoVM',
              items: [
                { text: 'Overview', link: '/denovm/' },
                { text: 'Quick Start', link: '/denovm/quick-start' },
                { text: 'Configuration', link: '/denovm/configuration' },
                { text: 'Execution Modes', link: '/denovm/execution-modes' },
                { text: 'Writing Scripts', link: '/denovm/writing-scripts' },
                { text: 'Request & Response', link: '/denovm/request-response' },
                { text: 'Architecture', link: '/denovm/architecture' },
                { text: 'Limitations', link: '/denovm/limitations' },
                { text: 'Troubleshooting', link: '/denovm/troubleshooting' }
              ]
            },
            {
              text: 'Flow',
              items: [
                { text: 'Overview', link: '/flow/' },
                { text: 'Quick Start', link: '/flow/quick-start' },
                { text: 'Configuration', link: '/flow/configuration' },
                { text: 'Usage Examples', link: '/flow/usage-examples' },
                { text: 'Services', link: '/flow/services' },
                { text: 'Validation', link: '/flow/validation' },
                { text: 'Best Practices', link: '/flow/best-practices' },
                { text: 'Architecture', link: '/flow/architecture' },
                { text: 'Troubleshooting', link: '/flow/troubleshooting' }
              ]
            },
            {
              text: 'JWT',
              items: [
                { text: 'Overview', link: '/jwt/' },
                { text: 'Quick Start', link: '/jwt/quick-start' },
                { text: 'Configuration', link: '/jwt/configuration' },
                { text: 'Usage Examples', link: '/jwt/usage-examples' },
                { text: 'API Reference', link: '/jwt/api-reference' },
                { text: 'Best Practices', link: '/jwt/best-practices' },
                { text: 'Troubleshooting', link: '/jwt/troubleshooting' },
                { text: 'Architecture', link: '/jwt/architecture' }
              ]
            }
          ]
        }
      ],
      '/frontend/': [
        {
          text: 'Frontend Library',
          items: [
            { text: 'Overview', link: '/frontend/' },
            {
              text: 'Nexxus PSP Components',
              link: '/frontend/nexxus'
            }
          ]
        }
      ],
      '/psp/': [
        {
          text: 'PSP Transaction Flow',
          items: [
            { text: 'Overview', link: '/psp/' },
            { text: 'Quick Start', link: '/psp/quick-start' },
            { text: 'API Reference', link: '/psp/api-reference' },
            { text: 'Error Handling', link: '/psp/error-handling' },
            { text: 'Best Practices', link: '/psp/best-practices' }
          ]
        }
      ]
    }
  }
})