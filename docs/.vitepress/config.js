import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Nexxus',
  description: 'PSP Orchestration - Uniting classic payment trust with next-gen orchestration.',
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
      { text: 'Backend Library', link: '/backend/' },
      { text: 'Frontend Library', link: '/frontend/' }
    ],
    sidebar: [
      {
        text: 'Backend Library',
        items: [
          { text: 'Overview', link: '/backend/' },
          {
            text: 'DenoVM',
            items: [
              { text: 'Overview', link: '/denovm/' },
              { text: 'Architecture', link: '/denovm/architecture' }
            ]
          },
          {
            text: 'Flow',
            items: [
              { text: 'Overview', link: '/flow/' },
              { text: 'Architecture', link: '/flow/architecture' }
            ]
          },
          {
            text: 'JWT',
            items: [
              { text: 'Overview', link: '/jwt/' },
              { text: 'Architecture', link: '/jwt/architecture' }
            ]
          }
        ]
      },
      {
        text: 'Frontend Library',
        items: [
          { text: 'Overview', link: '/frontend/' }
        ]
      }
    ]
  }
})