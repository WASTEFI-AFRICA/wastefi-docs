import { defineConfig } from 'vitepress'

const base = '/wastefi-docs/'

export default defineConfig({
  title: 'WasteFi',
  description: 'A guide to the WasteFi testnet demo, HTTP API and Soroban contracts.',
  lang: 'en',
  base,
  appearance: true,
  ignoreDeadLinks: false,

  // Keep unchecked guides in the repository without publishing their claims.
  // Remove an exclusion only after checking the page against the implementation.
  srcExclude: [
    'README.md',
    'CONTRIBUTING.md',
    'CODE_OF_CONDUCT.md',
    'about/**',
    'standards/**',
    'community/grant-templates.md',
    'guide/admin-guide.md',
    'guide/api-examples.md',
    'guide/architecture.md',
    'guide/ci-cd.md',
    'guide/collector-guide.md',
    'guide/configuration.md',
    'guide/customization.md',
    'guide/docker-setup.md',
    'guide/faq.md',
    'guide/operator-guide.md',
    'guide/production-setup.md',
    'guide/security.md',
    'guide/testing.md',
    'guide/troubleshooting.md',
    'technical/database-schema.md',
    'technical/design-decisions.md',
    'technical/mobile-money.md',
    'technical/recyclegraph-protocol.md',
    'technical/stellar-integration.md',
    'technical/system-design.md',
    'technical/technology-stack.md'
  ],

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}logo.svg` }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/overview' },
      { text: 'Contracts', link: '/technical/smart-contracts' },
      { text: 'Roadmap', link: '/community/roadmap' },
      { text: 'Try the demo', link: 'https://wastefi-frontend.vercel.app/login' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Start here',
          items: [
            { text: 'Try the Testnet Demo', link: '/guide/getting-started' },
            { text: 'Local Development', link: '/guide/local-development' },
            { text: 'Publish the Docs', link: '/guide/deployment' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/overview' },
            { text: 'Authentication', link: '/api/authentication' },
            { text: 'Users', link: '/api/users' },
            { text: 'Wallet', link: '/api/wallet' },
            { text: 'Collections', link: '/api/transactions' },
            { text: 'Public Materials', link: '/api/materials' },
            { text: 'Collection Points', link: '/api/collection-points' },
            { text: 'Payments', link: '/api/payments' },
            { text: 'Public Statistics', link: '/api/impact' },
            { text: 'Provider Callbacks', link: '/api/webhooks' },
            { text: 'Admin, Passports & Backups', link: '/api/operations' }
          ]
        }
      ],
      '/technical/': [
        {
          text: 'On Stellar',
          items: [
            { text: 'Smart Contracts', link: '/technical/smart-contracts' }
          ]
        }
      ],
      '/community/': [
        {
          text: 'Project',
          items: [
            { text: 'Roadmap', link: '/community/roadmap' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/WASTEFI-AFRICA' }
    ],
    footer: {
      message: 'WasteFi testnet MVP. Released under the MIT License.',
      copyright: 'Copyright © 2026-present WasteFi Africa'
    },
    search: { provider: 'local' }
  },

  markdown: { lineNumbers: true }
})
