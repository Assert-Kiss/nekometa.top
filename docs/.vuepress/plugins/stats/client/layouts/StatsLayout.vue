<script setup>
import { Layout } from 'vuepress-theme-plume/client'
import { useRoute } from 'vue-router'
import PageViews from '../components/PageViews.vue'

const route = useRoute()
</script>

<template>
  <Layout>
    <template #doc-meta-after>
      <div class="page-views-meta">
        <PageViews :path="route.path" />
      </div>
    </template>
  </Layout>
</template>

<style scoped>
.page-views-meta {
  display: flex;
  align-items: center;
}
</style>
