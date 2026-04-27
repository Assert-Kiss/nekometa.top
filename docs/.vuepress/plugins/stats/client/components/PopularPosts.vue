<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { usePageData } from '@vuepress/client'
import { useRoute, useRouter } from 'vue-router'
// @ts-ignore
import { pageMap } from '@stats/page-map'

const popularPosts = ref([])
const loading = ref(true)
const canShow = ref(false)
const targetSelector = ref('.vp-posts-aside')
const router = useRouter()
const route = useRoute()
const page = usePageData()

const workerUrl = (() => {
  // @ts-ignore
  let value = __STATS_WORKER_URL__
  if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1)
  }
  return value
})()

const enabled = computed(() => Boolean(workerUrl))
const shouldShow = computed(() => enabled.value && !page.value.path.includes('/404'))

let pollingTimer = null

const checkDomAndShow = async () => {
  if (typeof document === 'undefined') {
    return
  }

  if (pollingTimer) {
    clearTimeout(pollingTimer)
    pollingTimer = null
  }

  canShow.value = false
  if (!shouldShow.value) {
    return
  }

  await new Promise(resolve => setTimeout(resolve, 300))
  await nextTick()

  const selectors = ['.vp-posts-aside', '.vp-doc-aside']
  let attempts = 0

  const check = () => {
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector)
      if (elements.length > 0) {
        targetSelector.value = selector
        canShow.value = true
        return
      }
    }

    if (attempts < 50) {
      attempts += 1
      pollingTimer = setTimeout(check, 100)
    }
  }

  check()
}

watch(() => page.value.path, checkDomAndShow, { immediate: true })
watch(() => route.fullPath, checkDomAndShow)

const filteredPosts = computed(() => {
  return popularPosts.value.filter(post => {
    const normalizedPath = post.path.replace(/\/$/, '')

    if (post.path === '/' || post.path === '/index.html') return false
    if (normalizedPath.includes('/404')) return false
    if (normalizedPath === '/stats') return false
    if (normalizedPath.startsWith('/tags/')) return false
    if (normalizedPath.startsWith('/archives/')) return false
    if (normalizedPath.startsWith('/blog/categories/')) return false
    if (normalizedPath === '/friends' || normalizedPath === '/blog') return false
    if (post.path.includes('/page/')) return false

    const mapKey = Object.keys(pageMap).find(key =>
      key === post.path
      || key === normalizedPath
      || key === `${post.path}.html`
      || key.replace(/\/$/, '') === normalizedPath
      || key.replace(/\.html$/, '') === normalizedPath,
    )

    if (mapKey) {
      post._title = pageMap[mapKey]
    }

    return true
  }).slice(0, 10)
})

const getTitle = post => post._title || post.path

onMounted(async () => {
  if (!workerUrl) {
    loading.value = false
    return
  }

  try {
    const response = await fetch(`${workerUrl}/popular`)
    if (response.ok) {
      popularPosts.value = await response.json()
    }
  }
  catch (error) {
    console.error('[PopularPosts] Error:', error)
  }
  finally {
    loading.value = false
  }
})

const navigate = path => {
  router.push(path)
}
</script>

<template>
  <ClientOnly>
    <Teleport :to="targetSelector" v-if="canShow">
      <div class="popular-posts-widget" :class="{ 'in-doc': targetSelector === '.vp-doc-aside' }">
        <div class="widget-header">
          <span class="widget-title">热门文章</span>
        </div>

        <div v-if="loading" class="widget-state">
          加载中...
        </div>

        <div v-else-if="filteredPosts.length === 0" class="widget-state">
          暂无热门数据
        </div>

        <ul v-else class="post-list">
          <li v-for="(post, index) in filteredPosts" :key="post.path" @click="navigate(post.path)">
            <span class="post-rank" :class="{ 'top-3': index < 3 }">{{ index + 1 }}</span>
            <span class="post-title" :title="getTitle(post)">{{ getTitle(post) }}</span>
            <span class="post-count">{{ post.count }}</span>
          </li>
        </ul>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.popular-posts-widget {
  width: 100%;
  background-color: transparent;
  border: none;
  padding: 4px 0;
  font-size: 13px;
  margin-top: 20px;
}

.popular-posts-widget.in-doc {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--vp-c-divider);
}

.popular-posts-widget.in-doc .widget-header {
  border-bottom: none;
  margin-bottom: 4px;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--vp-c-divider, #eaecef);
}

.widget-title {
  margin-left: 12px;
  font-weight: 600;
  font-size: 14px;
}

.widget-state {
  text-align: center;
  padding: 20px;
  color: #999;
}

.post-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.post-list li {
  display: flex;
  align-items: center;
  padding: 6px 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.post-list li:hover {
  background-color: var(--vp-c-bg-soft, #f8f8f8);
}

.post-rank {
  width: 20px;
  text-align: center;
  margin-right: 8px;
  font-weight: bold;
  color: var(--vp-c-text-2, #666);
}

.post-rank.top-3 {
  color: #f60;
}

.post-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
}

.post-count {
  font-size: 12px;
  color: var(--vp-c-text-2, #999);
  min-width: 30px;
  text-align: right;
}
</style>
