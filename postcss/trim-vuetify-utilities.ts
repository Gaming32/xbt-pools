import type { PluginCreator } from "postcss";

/**
 * Removes the responsive variants of Vuetify's utility classes (e.g. `pa-sm-4`, `d-lg-none`) for every breakpoint except md,
 * which is the only one we use. These make up most of Vuetify's utility CSS.
 */
const trimVuetifyUtilities: PluginCreator<void> = () => ({
  postcssPlugin: "trim-vuetify-utilities",
  AtRule: {
    media(atRule) {
      if (
        atRule.source?.input.file?.endsWith(
          "vuetify/lib/styles/utilities.css",
        ) &&
        atRule.params.includes("width") &&
        !atRule.params.includes("(min-width: 840px)")
      ) {
        atRule.remove();
      }
    },
  },
});
trimVuetifyUtilities.postcss = true;

export default trimVuetifyUtilities;
