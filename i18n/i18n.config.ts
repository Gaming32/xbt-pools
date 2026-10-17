import { en, zhHans } from "vuetify/locale";

export default {
  fallbackLocale: "en",
  // Vuetify's own strings are looked up through vue-i18n, so they need to be included in its messages
  messages: {
    en: { $vuetify: en },
    zh: { $vuetify: zhHans },
  },
};
