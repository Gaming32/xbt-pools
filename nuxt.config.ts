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
    locales: [{ code: "en", name: "English", file: "en.json" }],
  },

  modules: ["@nuxt/eslint", "@nuxt/icon", "@nuxt/scripts", "@nuxtjs/i18n"],

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
