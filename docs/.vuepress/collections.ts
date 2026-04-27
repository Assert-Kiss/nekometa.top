import { defineCollection, defineCollections } from 'vuepress-theme-plume'

const blog = defineCollection({
  type: 'post',
  dir: 'blog',
  title: '博客',
  link: '/blog/',
  tags: true,
  archives: true,
  categories: true,
  postCover: 'right',
})

export default defineCollections([
  blog,
])
