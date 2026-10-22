<script setup lang="ts">
const { locale, locales, setLocale } = useI18n();
const theme = useTheme();
const config = useRuntimeConfig();

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

const APP_BAR_HEIGHT = 64;
const mounted = ref(false);

type ThemeName = "light" | "dark";

const themeCookie = useCookie<ThemeName | null>("theme", {
  maxAge: COOKIE_EXPIRY,
});
const systemThemeCookie = useCookie<ThemeName | null>("system-theme", {
  maxAge: COOKIE_EXPIRY,
});

const initialTheme = useState<ThemeName>("initial-theme", () => {
  const hint = useRequestHeaders(["sec-ch-prefers-color-scheme"])[
    "sec-ch-prefers-color-scheme"
  ]?.replaceAll('"', "");
  const hintedTheme = hint === "light" || hint === "dark" ? hint : null;
  return themeCookie.value ?? hintedTheme ?? systemThemeCookie.value ?? "dark";
});
theme.change(initialTheme.value);

const darkQuery = import.meta.client
  ? window.matchMedia("(prefers-color-scheme: dark)")
  : null;

function getSystemTheme(): ThemeName {
  return darkQuery?.matches ? "dark" : "light";
}

function saveSystemTheme() {
  systemThemeCookie.value = getSystemTheme();
}

onMounted(() => {
  mounted.value = true;
  saveSystemTheme();
  darkQuery?.addEventListener("change", saveSystemTheme);
  if (!themeCookie.value) {
    theme.change("system");
  }
});

onUnmounted(() => {
  darkQuery?.removeEventListener("change", saveSystemTheme);
});

async function toggleTheme(event: MouseEvent) {
  const newTheme = theme.current.value.dark ? "light" : "dark";
  const followSystem = newTheme === getSystemTheme();
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
      <v-app-bar-title class="ms-3">
        <NuxtLink to="/" class="home-link">
          <v-avatar color="primary" size="36" class="mr-5">
            <v-icon icon="lucide:bitcoin" color="#fff" />
          </v-avatar>
          <span class="font-weight-bold">{{ $t("title") }}</span>
        </NuxtLink>
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
      <slot />
    </v-main>
    <v-footer
      class="d-flex align-center justify-center flex-wrap flex-grow-1 flex-column py-3"
    >
      <div>&copy;{{ config.public.buildYear }} Taki</div>
      <div v-if="config.public.git.commit">
        Commit
        <component
          :is="config.public.git.remote ? 'a' : 'span'"
          :href="`${config.public.git.remote}/tree/${config.public.git.commit}`"
          target="_blank"
          >{{ config.public.git.commit.substring(0, 7) }}</component
        >
        <template v-if="config.public.git.dirty"> (DIRTY)</template>
      </div>
      <div v-if="config.public.git.pullRequest">
        Pull request
        <component
          :is="config.public.git.remote ? 'a' : 'span'"
          :href="`${config.public.git.remote}/pull/${config.public.git.pullRequest}`"
          target="_blank"
          >#{{ config.public.git.pullRequest }}</component
        >
      </div>
    </v-footer>
  </v-app>
</template>

<style>
:root {
  --v-font-body:
    "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "PingFang SC",
    "Microsoft YaHei", sans-serif;
}

.home-link {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  color: inherit;
  text-decoration: none;
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

.text-tabular {
  font-variant-numeric: tabular-nums;
}
</style>
