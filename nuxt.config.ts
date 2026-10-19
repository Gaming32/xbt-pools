import { spawnSync } from "node:child_process";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  app: {
    head: {
      style: [
        {
          // In dev, component styles can load before Vuetify's core.css, which would reorder its layers
          innerHTML:
            "@layer vuetify-core, vuetify-components, vuetify-overrides, vuetify-utilities, vuetify-final;",
          tagPriority: "critical",
        },
      ],
    },
  },

  css: ["vuetify/styles/utilities"],

  postcss: {
    plugins: {
      "~~/postcss/trim-vuetify-utilities": {},
    },
  },

  features: {
    inlineStyles: false,
  },

  runtimeConfig: {
    public: {
      mempoolUrl: "https://mempool.guide",
      buildYear: new Date().getUTCFullYear(),
      git: {
        commit: (() => {
          if (process.env.VERCEL_GIT_COMMIT_SHA) {
            return process.env.VERCEL_GIT_COMMIT_SHA;
          } else {
            try {
              return spawnSync("git", ["rev-parse", "HEAD"])
                .stdout.toString()
                .trim();
            } catch {
              return undefined;
            }
          }
        })(),
        remote: (() => {
          if (process.env.VERCEL_GIT_PROVIDER === "github") {
            return `https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`;
          } else {
            try {
              return spawnSync("git", ["remote", "get-url", "origin"])
                .stdout.toString()
                .trim()
                .replace(/\.git$/, "");
            } catch {
              return undefined;
            }
          }
        })(),
        dirty: (() => {
          try {
            return !!spawnSync("git", ["status", "--porcelain"]).stdout.length;
          } catch {
            return undefined;
          }
        })(),
        pullRequest: process.env.VERCEL_GIT_PULL_REQUEST_ID,
      },
    },
  },

  i18n: {
    defaultLocale: "en",
    strategy: "no_prefix",
    experimental: {
      typedOptionsAndMessages: "default",
    },
    baseUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000",
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
    moduleOptions: {
      prefixComposables: ["useLayout"],
      // Utilities are imported in `css` above, so they can be trimmed by postcss/trim-vuetify-utilities.ts.
      // The color palette classes (e.g. `text-red`) are unused, so use CSS colors for anything outside the theme.
      styles: { utilities: false, colors: false },
    },
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
