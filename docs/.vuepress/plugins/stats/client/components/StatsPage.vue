<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
// @ts-ignore
import { pageMap } from '@stats/page-map'

const router = useRouter()

const workerUrl = (() => {
  // @ts-ignore
  let value = __STATS_WORKER_URL__
  if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1)
  }
  return value
})()

const periods = [
  { label: '24 小时', value: '24h' },
  { label: '7 天', value: '7d' },
  { label: '30 天', value: '30d' },
  { label: '1 年', value: '1y' },
]

const stats = ref({ total: 0, pages: [], countries: [], uas: [], refs: [] })
const currentPeriod = ref('7d')
const startDate = ref('')
const endDate = ref('')
const loading = ref(false)
const error = ref('')
const enabled = computed(() => Boolean(workerUrl))

const getPageTitle = path => {
  if (!path) return 'Unknown'
  if (pageMap && pageMap[path]) return pageMap[path]

  let decoded = path
  try {
    decoded = decodeURI(path)
  }
  catch {}

  if (pageMap && pageMap[decoded]) return pageMap[decoded]

  const cleanPath = decoded.replace(/(\.html|\/)$/, '')
  if (pageMap && pageMap[cleanPath]) return pageMap[cleanPath]
  if (pageMap && pageMap[`${cleanPath}.html`]) return pageMap[`${cleanPath}.html`]
  if (pageMap && pageMap[`${cleanPath}/`]) return pageMap[`${cleanPath}/`]

  return decoded
}

const getCountryName = code => {
  if (!code || code === 'Unknown' || code === 'XX') return '未知地区'
  try {
    const regionNames = new Intl.DisplayNames(['zh-Hans'], { type: 'region' })
    return regionNames.of(code) || code
  }
  catch {
    return code
  }
}

const sortedPages = computed(() => (stats.value.pages || []).slice(0, 10))
const sortedRefs = computed(() => (stats.value.refs || []).slice(0, 10))
const sortedCountries = computed(() => (stats.value.countries || []).slice(0, 10))
const sortedUas = computed(() => (stats.value.uas || []).slice(0, 10))

const fetchUrl = async url => {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch(url)
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('统计接口返回了非 JSON 数据')
    }

    if (!response.ok) {
      throw new Error(`统计接口请求失败: ${response.status}`)
    }

    stats.value = await response.json()
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '统计数据加载失败'
  }
  finally {
    loading.value = false
  }
}

const fetchStats = async period => {
  currentPeriod.value = period
  if (!workerUrl) {
    error.value = '未配置统计 Worker 地址'
    return
  }

  await fetchUrl(`${workerUrl}/stats?period=${period}`)
}

const fetchCustom = async () => {
  if (!workerUrl) {
    error.value = '未配置统计 Worker 地址'
    return
  }

  if (!startDate.value || !endDate.value) {
    error.value = '请选择开始和结束日期'
    return
  }

  await fetchUrl(`${workerUrl}/stats?start=${startDate.value}&end=${endDate.value}`)
}

const openPage = path => {
  router.push(path)
}

onMounted(() => {
  if (workerUrl) {
    fetchStats(currentPeriod.value)
  }
})
</script>

<template>
  <div class="stats-container">
    <div class="stats-header">
      <div>
        <p class="eyebrow">Site Analytics</p>
        <h1>网站统计</h1>
        <p class="intro">这里保留了模板里的统计入口。配置好 `VUEPRESS_STATS_WORKER_URL` 后，这个页面会开始展示访问数据。</p>
      </div>
      <div class="summary-card">
        <span class="summary-label">总访问量</span>
        <strong class="summary-value">{{ stats.total || 0 }}</strong>
      </div>
    </div>

    <div v-if="enabled" class="controls">
      <div class="btn-group">
        <button
          v-for="period in periods"
          :key="period.value"
          :class="{ active: currentPeriod === period.value }"
          @click="fetchStats(period.value)"
        >
          {{ period.label }}
        </button>
      </div>
      <div class="date-picker-group">
        <input v-model="startDate" type="date">
        <span>至</span>
        <input v-model="endDate" type="date">
        <button @click="fetchCustom">查询</button>
      </div>
    </div>

    <div v-if="!enabled" class="empty-state">
      <h2>统计功能暂未启用</h2>
      <p>给站点运行环境设置 `VUEPRESS_STATS_WORKER_URL` 后，页面浏览量、热门文章和统计页会自动启用。</p>
    </div>

    <div v-else-if="loading" class="empty-state">
      <p>正在加载统计数据...</p>
    </div>

    <div v-else-if="error" class="empty-state error-state">
      <p>{{ error }}</p>
    </div>

    <div v-else class="stats-grid">
      <section class="card">
        <div class="card-head">
          <h2>页面访问</h2>
          <span>Top 10</span>
        </div>
        <ul class="rank-list">
          <li v-for="page in sortedPages" :key="page.path" @click="openPage(page.path)">
            <span class="rank-title">{{ getPageTitle(page.path) }}</span>
            <span class="rank-meta">{{ page.count }}</span>
          </li>
        </ul>
      </section>

      <section class="card">
        <div class="card-head">
          <h2>访客来源</h2>
          <span>Top 10</span>
        </div>
        <ul class="rank-list">
          <li v-for="referrer in sortedRefs" :key="referrer.ref || 'direct'">
            <span class="rank-title">{{ referrer.ref || 'Direct / Unknown' }}</span>
            <span class="rank-meta">{{ referrer.count }}</span>
          </li>
        </ul>
      </section>

      <section class="card">
        <div class="card-head">
          <h2>国家 / 地区</h2>
          <span>Top 10</span>
        </div>
        <ul class="rank-list">
          <li v-for="country in sortedCountries" :key="country.country || 'unknown'">
            <span class="rank-title">{{ getCountryName(country.country) }}</span>
            <span class="rank-meta">{{ country.count }}</span>
          </li>
        </ul>
      </section>

      <section class="card">
        <div class="card-head">
          <h2>终端概览</h2>
          <span>Top 10</span>
        </div>
        <ul class="rank-list">
          <li v-for="ua in sortedUas" :key="ua.ua || 'unknown'">
            <span class="rank-title">{{ ua.ua || 'Unknown' }}</span>
            <span class="rank-meta">{{ ua.count }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 64px;
}

.stats-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 24px;
  align-items: stretch;
  margin-bottom: 28px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

.stats-header h1 {
  margin: 0 0 12px;
}

.intro {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.8;
}

.summary-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(59, 130, 246, 0.12));
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  box-shadow: var(--vp-shadow-1);
}

.summary-label {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.summary-value {
  font-size: 40px;
  line-height: 1;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.btn-group,
.date-picker-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.btn-group button,
.date-picker-group button,
.date-picker-group input {
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  padding: 10px 14px;
  font: inherit;
}

.btn-group button,
.date-picker-group button {
  cursor: pointer;
}

.btn-group button.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: white;
}

.empty-state {
  padding: 40px 28px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 18px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}

.error-state {
  color: #b42318;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 18px;
  padding: 22px;
  box-shadow: var(--vp-shadow-1);
}

.card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
  margin-bottom: 14px;
}

.card-head h2 {
  margin: 0;
  font-size: 18px;
}

.card-head span {
  color: var(--vp-c-text-3);
  font-size: 13px;
}

.rank-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rank-list li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.rank-list li:last-child {
  border-bottom: 0;
}

.rank-list li:has(.rank-title) {
  cursor: default;
}

.rank-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-meta {
  flex-shrink: 0;
  color: var(--vp-c-text-2);
}

@media (max-width: 960px) {
  .stats-header,
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
