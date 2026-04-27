import { defineClientConfig } from '@vuepress/client'
import { useRouter } from 'vue-router'
import PageViews from './components/PageViews.vue'
import PopularPosts from './components/PopularPosts.vue'
import StatsLayout from './layouts/StatsLayout.vue'
import FullStatsLayout from './layouts/FullStatsLayout.vue'

export default defineClientConfig({
  layouts: {
    Layout: StatsLayout,
    StatsLayout: FullStatsLayout,
  },
  rootComponents: [
    PopularPosts,
  ],
  enhance({ app }) {
    app.component('PageViews', PageViews)
  },
  setup() {
    const router = useRouter()

    const workerUrl = (() => {
      // @ts-ignore
      let value = __STATS_WORKER_URL__
      if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1)
      }
      return value
    })()

    const sendView = path => {
      if (!workerUrl || typeof window === 'undefined') {
        return
      }

      try {
        const payload = {
          path,
          referrer: document.referrer || null,
          ua: navigator.userAgent || null,
          lang: navigator.language || null,
          screen: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : null,
          ts: Date.now(),
        }

        const body = JSON.stringify(payload)

        if (navigator.sendBeacon) {
          const blob = new Blob([body], { type: 'application/json' })
          navigator.sendBeacon(workerUrl, blob)
        }
        else {
          fetch(workerUrl, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body,
          }).catch(() => {})
        }
      }
      catch (error) {
        console.error(error)
      }
    }

    if (typeof window !== 'undefined' && workerUrl && router?.afterEach) {
      router.afterEach((to, from) => {
        const toPath = to.fullPath.split('#')[0]
        const fromPath = from?.fullPath?.split('#')[0]

        if (toPath === fromPath) {
          return
        }

        sendView(toPath)
      })
    }
  },
})
