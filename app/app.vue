<script setup lang="ts">
useHead({
  title: () => $t("title"),
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
