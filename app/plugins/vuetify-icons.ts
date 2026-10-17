import { Icon } from "#components";
import type { IconProps, IconSet } from "vuetify";
import { aliases as lucideAliases } from "vuetify/iconsets/lucide";

/** Renders Vuetify icons through @nuxt/icon, so we can use the local Lucide collection */
const nuxtIconSet: IconSet = {
  component: (props: IconProps) =>
    h(props.tag, [h(Icon, { name: String(props.icon).replace(/^i-/, "") })]),
};

export default defineNuxtPlugin({
  name: "vuetify-icons",
  enforce: "pre",
  setup(nuxtApp) {
    nuxtApp.hook("vuetify:before-create", ({ vuetifyOptions }) => {
      vuetifyOptions.icons = {
        defaultSet: "nuxt",
        aliases: Object.fromEntries(
          Object.entries(lucideAliases).filter(
            ([, value]) => typeof value === "string",
          ),
        ),
        sets: { nuxt: nuxtIconSet },
      };
    });
  },
});
