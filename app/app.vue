<script setup lang="ts">
const { locale, locales, setLocale } = useI18n();

useHeadSafe(useLocaleHead());
</script>

<template>
  <div>
    <NuxtLoadingIndicator />
    <div>
      <v-btn-toggle mandatory rounded="xl" color="primary" variant="outlined" divided :model-value="locale"
        @update:model-value="setLocale">
        <v-btn v-for="localeOption in locales" :key="localeOption.code" :value="localeOption.code">{{ localeOption.name
        }}</v-btn>
      </v-btn-toggle>
    </div>
    <NuxtPage />
  </div>
</template>
