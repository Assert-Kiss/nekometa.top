import { defineThemeConfig } from 'vuepress-theme-plume'
import navbar from './navbar'
import collections from './collections'

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

const siteBase = normalizeBase(process.env.VUEPRESS_BASE || '/')
const siteHostname = (process.env.VUEPRESS_HOSTNAME || 'https://www.nekometa.top').replace(/\/+$/, '')
const siteRepoUrl = (process.env.VUEPRESS_REPO_URL || '').trim()
const siteDocsBranch = (process.env.VUEPRESS_DOCS_BRANCH || process.env.GITHUB_REF_NAME || 'master').trim()
const withBase = (assetPath: string) => `${siteBase}${assetPath.replace(/^\/+/, '')}`

export default defineThemeConfig({
  logo: withBase('images/logo.svg'),
  home: '/',
  hostname: siteHostname,
  docsRepo: siteRepoUrl || undefined,
  docsDir: 'docs',
  docsBranch: siteDocsBranch,
  lastUpdated: true,
  cache: 'filesystem',
  search: { provider: 'local' },
  footer: {
    message: '© 2026 NekoMeta · www.nekometa.top',
  },
  profile: {
    avatar: withBase('images/logo.svg'),
    name: 'NekoMeta',
    description: '专注机场推荐、科学上网与翻墙工具。',
  },
  navbar,
  collections,
  social: [],
  llmstxt: true,
  markdown: {
    collapse: true,
    youtube: true,
    abbr: true,
  },
})
