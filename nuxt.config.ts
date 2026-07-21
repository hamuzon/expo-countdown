// @ts-nocheck
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  ignore: [
    'pages/index.vue'
  ],
  ssr: true, // Enabled for OGP pre-rendering on GitHub Pages
  experimental: {
    appManifest: false
  },
  app: {
    baseURL: process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : '/',
    head: {
      htmlAttrs: {
        lang: 'ja'
      },
      title: 'Expo Countdown',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { key: 'description', name: 'description', content: '万博の開催まで、開催期間中、終了後の経過時間をリアルタイムで表示するカウントダウンタイマーです。' },
        { name: 'keywords', content: '万博, EXPO, カウントダウン, Countdown, 2025, 2027, 2030, 大阪, 横浜, リヤド' },
        { name: 'author', content: 'hamuzon' },
        { key: 'og:description', property: 'og:description', content: '万博の開催まで、開催期間中、終了後の経過時間をリアルタイムで表示するカウントダウンタイマーです。' },
        { property: 'og:type', content: 'website' },
        { key: 'og:locale', property: 'og:locale', content: 'ja_JP' },
        { name: 'twitter:card', content: 'summary' },
        { key: 'twitter:description', name: 'twitter:description', content: '万博の開催まで、開催期間中、終了後の経過時間をリアルタイムで表示するカウントダウンタイマーです。' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        { rel: 'icon', sizes: 'any', href: '/favicon.ico' }
      ],
      script: [
        {
          innerHTML: `if (window.location.hostname.endsWith('.')) { window.location.replace(window.location.href.replace(window.location.hostname, window.location.hostname.slice(0, -1))); }`
        }
      ]
    }
  },
  nitro: {
    experimental: {
      cloudflare: {
        nodejsCompat: true
      }
    },
    prerender: {
      routes: [
        '/',
        '/2025/ja', '/2025/en',
        '/2027/ja', '/2027/en',
        '/2030/ja', '/2030/en',
      ]
    }
  },
  css: [
    '~/assets/base.css'
  ],
  devtools: { enabled: true }
})
