---
title: 数据统计
description: 查看 NekoMeta 的访问统计、热门内容和访客来源。
pageClass: custom-page-class
layout: Layout
sidebar: false
aside: false
comments: false
stats: false
permalink: /stats/
---

<StatsPage />

<style>
.custom-page-class .vp-doc,
.custom-page-class .vp-doc-container .container,
.custom-page-class .vp-doc-container .content,
.custom-page-class .vp-doc-container .content-container {
  max-width: 100% !important;
}

@media (min-width: 960px) {
  .custom-page-class .vp-doc-container:not(.has-sidebar) .container,
  .custom-page-class .vp-doc-container:not(.has-sidebar) .content {
    max-width: 90% !important;
  }
}

@media (min-width: 1440px) {
  .custom-page-class .vp-doc-container:not(.has-sidebar) .container,
  .custom-page-class .vp-doc-container:not(.has-sidebar) .content {
    max-width: 90% !important;
  }
}
</style>

<script setup>
import StatsPage from '@stats/StatsPage.vue'
</script>
