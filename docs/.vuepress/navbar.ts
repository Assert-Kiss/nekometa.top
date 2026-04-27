import { defineNavbarConfig } from 'vuepress-theme-plume'

export default defineNavbarConfig([
  { text: 'NekoMeta', link: '/', icon: 'material-symbols:home-rounded' },
  { text: '博客', link: '/blog/', icon: 'material-symbols:article-rounded' },
  { text: '机场推荐', link: '/airport/', icon: 'material-symbols:flight-takeoff' },
  { text: '翻墙工具', link: '/tools/', icon: 'ic:baseline-construction' },
  {
    text: '更多',
    icon: 'icon-park-outline:more-three',
    items: [
      { text: '归档', link: '/blog/archives/', icon: 'material-symbols:archive-rounded' },
      { text: '友链', link: '/friends/', icon: 'material-symbols:footprint' },
      { text: '标签', link: '/blog/tags/', icon: 'material-symbols:sell' },
      { text: '统计', link: '/stats/', icon: 'ic:baseline-data-usage' },
    ],
  },
])
