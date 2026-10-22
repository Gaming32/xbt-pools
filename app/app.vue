<script setup lang="ts">
const config = useRuntimeConfig();

useSeoMeta({
  title: () => $t("title"),
  description: () => $t("subtitle"),
  ogTitle: () => $t("title"),
  ogDescription: () => $t("subtitle"),
  ogUrl: config.app.baseURL,
  ogImage: new URL("/favicon.png", config.app.cdnURL).href,
  ogImageWidth: 80,
  ogImageHeight: 80,
  themeColor: "#e8830c",
  twitterCard: "summary",
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
