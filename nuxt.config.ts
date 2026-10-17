// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  features: {
    inlineStyles: false,
  },

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

  vuetify: {
    vuetifyOptions: {
      // Configured in app/plugins/vuetify-icons.ts
      icons: false,
      theme: {
        defaultTheme: "light",
        themes: {
          light: {
            colors: {
              primary: "#e8830c",
              secondary: "#4d4d4e",
              background: "#f6f5f2",
              surface: "#ffffff",
            },
          },
          dark: {
            colors: {
              primary: "#f7931a",
              secondary: "#b0b0b5",
              background: "#111214",
              surface: "#1b1c1f",
            },
          },
        },
      },
      defaults: {
        VCard: { rounded: "lg" },
        VSelect: {
          variant: "outlined",
          density: "comfortable",
          hideDetails: true,
          color: "primary",
        },
        VTextField: {
          variant: "outlined",
          density: "comfortable",
          hideDetails: true,
          color: "primary",
        },
      },
    },
  },

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
