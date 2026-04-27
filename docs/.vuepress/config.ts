import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from 'vuepress'
import { plumeTheme } from 'vuepress-theme-plume'
// @ts-ignore
import statsPlugin from './plugins/stats/index.js'
import themeConfig from './plume.config'

const normalizeBase = (value: string) => {
  let base = (value || '/').trim() || '/'
  if (!base.startsWith('/')) {
    base = `/${base}`
  }
  if (!base.endsWith('/')) {
    base = `${base}/`
  }
  return base.replace(/\/{2,}/g, '/')
}

const defaultHostname = 'https://www.nekometa.top'
const siteHostname = (process.env.VUEPRESS_HOSTNAME || defaultHostname).replace(/\/+$/, '')
const withBase = (assetPath: string) => `${siteBase}${assetPath.replace(/^\/+/, '')}`
const siteBase = normalizeBase(process.env.VUEPRESS_BASE || '/')
const withHostname = (assetPath: string) => `${siteHostname}${withBase(assetPath)}`

export default defineUserConfig({
  base: siteBase,
  lang: 'zh-CN',
  title: 'NekoMeta',
  description: 'NekoMeta 专注机场推荐、科学上网、翻墙工具与实用教程，持续更新稳定机场测评、Clash 配置和上网指南。',
  plugins: [
    statsPlugin({
      workerUrl: process.env.VUEPRESS_STATS_WORKER_URL || '',
    }),
  ],
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: withBase('images/favicon.svg') }],
    ['meta', { name: 'keywords', content: '机场推荐, 科学上网, 翻墙工具, Clash教程, VPN推荐, 节点订阅, 机场测评, NekoMeta' }],
    ['meta', { name: 'description', content: 'NekoMeta 专注机场推荐、科学上网、翻墙工具与实用教程，持续更新稳定机场测评、Clash 配置和上网指南。' }],
    ['meta', { name: 'theme-color', content: '#0f172a' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],
    ['meta', { property: 'og:site_name', content: 'NekoMeta' }],
    ['meta', { property: 'og:image', content: withHostname('images/og-cover.svg') }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { property: 'twitter:image', content: withHostname('images/og-cover.svg') }],
  ],
  bundler: viteBundler(),
  shouldPrefetch: false,
  theme: plumeTheme(themeConfig),
})
