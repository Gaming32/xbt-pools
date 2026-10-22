<script setup lang="ts">
const config = useRuntimeConfig();

useSeoMeta({
  title: () => $t("title"),
  description: () => $t("subtitle"),
  ogTitle: () => $t("title"),
  ogDescription: () => $t("title"),
  ogUrl: config.app.baseURL,
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
