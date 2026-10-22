<script setup lang="ts">
const config = useRuntimeConfig();

const cdnUrl = config.app.cdnURL || config.public.i18n.baseUrl;

useSeoMeta({
  title: () => $t("title"),
  description: () => $t("subtitle"),
  ogTitle: () => $t("title"),
  ogDescription: () => $t("subtitle"),
  ogUrl: config.public.i18n.baseUrl,
  ogImage: new URL("/favicon.png", cdnUrl).href,
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
