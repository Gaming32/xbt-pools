<script setup lang="ts">
const { locale, locales, setLocale } = useI18n();
const theme = useTheme();

useHeadSafe(useLocaleHead());
useHead({
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossorigin: "",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
    },
  ],
});

const themeCookie = useCookie<"light" | "dark" | null>("theme", {
  maxAge: 60 * 60 * 24 * 365,
});
theme.change(themeCookie.value ?? "light");

const APP_BAR_HEIGHT = 64;
const mounted = ref(false);

onMounted(() => {
  mounted.value = true;
  if (!themeCookie.value) {
    theme.change("system");
  }
});

async function toggleTheme(event: MouseEvent) {
  const newTheme = theme.current.value.dark ? "light" : "dark";
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  const followSystem = newTheme === systemTheme;
  themeCookie.value = followSystem ? null : newTheme;

  const root = document.documentElement;
  root.classList.add("theme-switching");
  theme.setTransitionOrigin(event.currentTarget as Element);
  await theme.change(followSystem ? "system" : newTheme, true);
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );
  root.classList.remove("theme-switching");
}
</script>

<template>
  <v-app>
    <NuxtLoadingIndicator color="rgb(var(--v-theme-primary))" />
    <v-app-bar flat border="b" color="surface" :height="APP_BAR_HEIGHT">
      <template #prepend>
        <v-avatar color="primary" size="36" class="ml-2">
          <v-icon icon="lucide:bitcoin" color="white" />
        </v-avatar>
      </template>
      <v-app-bar-title>
        <span class="font-weight-bold">{{ $t("title") }}</span>
        <span
          class="text-medium-emphasis text-body-medium ml-3 d-none d-md-inline"
          >{{ $t("subtitle") }}</span
        >
      </v-app-bar-title>
      <template #append>
        <v-btn-toggle
          mandatory
          rounded="xl"
          color="primary"
          variant="outlined"
          density="compact"
          divided
          class="mr-2"
          :model-value="locale"
          @update:model-value="setLocale"
        >
          <v-btn
            v-for="localeOption in locales"
            :key="localeOption.code"
            :value="localeOption.code"
            size="small"
            >{{ localeOption.name }}</v-btn
          >
        </v-btn-toggle>
        <v-btn
          icon
          variant="text"
          :aria-label="$t('toggleTheme')"
          @click="toggleTheme"
        >
          <v-icon
            :icon="theme.current.value.dark ? 'lucide:sun' : 'lucide:moon'"
          />
        </v-btn>
      </template>
    </v-app-bar>
    <!-- VAppBar reports a height of 0 until mounted, so SSR would leave the content under it -->
    <v-main
      :style="mounted ? undefined : { '--v-layout-top': `${APP_BAR_HEIGHT}px` }"
    >
      <NuxtPage />
    </v-main>
  </v-app>
</template>

<style>
:root {
  --v-font-body:
    "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "PingFang SC",
    "Microsoft YaHei", sans-serif;
}

.theme-switching *,
.theme-switching *::before,
.theme-switching *::after {
  transition: none !important;
}

code,
pre {
  font-family: "JetBrains Mono", ui-monospace, "SFMono-Regular", monospace;
}
</style>
