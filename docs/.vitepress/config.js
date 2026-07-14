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
      { text: 'Platform Guide', link: '/nexxus/' },
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
                { text: 'Dashboard', link: '/flow/dashboard' },
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
                { text: 'Dashboard', link: '/flow/dashboard' },
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
                { text: 'Dashboard', link: '/flow/dashboard' },
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
                { text: 'Dashboard', link: '/flow/dashboard' },
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
            },
            {
              text: 'Theming',
              link: '/frontend/nexxus-theming'
            },
            {
              text: 'Transaction Rule',
              link: '/frontend/transaction-rule'
            },
            {
              text: 'Routing Rule',
              link: '/frontend/routing-rule'
            },
            {
              text: 'Risk Rule',
              link: '/frontend/risk-rule'
            },
            {
              text: 'Fee Rule',
              link: '/frontend/fee-rule'
            }
          ]
        }
      ],
      '/nexxus/': [
        {
          text: 'Nexxus Platform Guide',
          items: [
            { text: 'Overview', link: '/nexxus/' },
            { text: 'Coverage & Framework', link: '/nexxus/coverage' },
            { text: 'Identity — FI & Users', link: '/nexxus/identity' },
            { text: 'Brand & Tenancy', link: '/nexxus/brand' },
            { text: 'Authentication & RBAC', link: '/nexxus/auth' },
            { text: 'PSP & Fetch-PSP', link: '/nexxus/psp-fetch-psp' },
            { text: 'Request & Persistence', link: '/nexxus/request' },
            { text: 'Flow Engine & Deno VM', link: '/nexxus/flow-denovm' },
            { text: 'Transaction Lifecycle', link: '/nexxus/transaction' },
            { text: 'External API & Webhooks', link: '/nexxus/external-api' },
            { text: 'Frontend Architecture', link: '/nexxus/frontend' },
            { text: 'CRM / External Integration', link: '/nexxus/integration' }
          ]
        }
      ]
    }
  }
})