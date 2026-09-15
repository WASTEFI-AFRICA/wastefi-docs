import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'WasteFi',
  description: 'Financial Inclusion Through Waste Collection - Powered by Open Material Standards',
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/overview' },
      { text: 'About', link: '/about/overview' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Architecture', link: '/guide/architecture' }
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
            { text: 'Transactions', link: '/api/transactions' },
            { text: 'Materials', link: '/api/materials' },
            { text: 'Collection Points', link: '/api/collection-points' },
            { text: 'Payments', link: '/api/payments' },
            { text: 'Impact', link: '/api/impact' }
          ]
        }
      ],
      '/technical/': [
        {
          text: 'Technical Documentation',
          items: [
            { text: 'System Design', link: '/technical/system-design' },
            { text: 'Technology Stack', link: '/technical/technology-stack' },
            { text: 'Design Decisions', link: '/technical/design-decisions' },
            { text: 'Smart Contracts', link: '/technical/smart-contracts' }
          ]
        }
      ],
      '/about/': [
        {
          text: 'About WasteFi',
          items: [
            { text: 'Project Overview', link: '/about/overview' },
            { text: 'Vision & Mission', link: '/about/vision' },
            { text: 'The Problem', link: '/about/problem' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/wastefi' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present WasteFi Team'
    },

    search: {
      provider: 'local'
    }
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]
  ]
})
