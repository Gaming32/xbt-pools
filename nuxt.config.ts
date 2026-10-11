// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      mempoolUrl: "https://mempool.guide",
    },
  },

  i18n: {
    defaultLocale: "en",
    experimental: {
      typedOptionsAndMessages: "default",
    },
    locales: [
      { code: "en", name: "English", language: "en-US", file: "en.json" },
      { code: "zh", name: "中文", language: "zh-CN", file: "zh.json" },
    ],
  },

  modules: [
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxt/scripts",
    "@nuxtjs/i18n",
    "vuetify-nuxt-module",
  ],

  typescript: {
    sharedTsConfig: {
      compilerOptions: {
        paths: {
          "#i18n": ["../.nuxt/types/i18n-messages.d.ts"],
        },
      },
      include: ["**/*", "../.nuxt/types/i18n-messages.d.ts"],
    },
  },
});
