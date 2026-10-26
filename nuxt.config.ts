import { spawnSync } from "node:child_process";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  app: {
    cdnURL: siteUrl,
    head: {
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          sizes: "any",
          href: "/favicon.svg",
        },
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
      ],
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

  experimental: {
    appManifest: true,
    checkOutdatedBuildInterval: 60 * 60 * 1000,
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
        dirty:
          !process.env.VERCEL &&
          (() => {
            try {
              return !!spawnSync("git", ["status", "--porcelain"]).stdout
                .length;
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
    baseUrl: siteUrl,
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
});
