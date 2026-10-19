/* eslint-disable @typescript-eslint/no-empty-object-type */

import type en from "../i18n/locales/en.json";

type EnMessages = typeof en;

declare module "vue-i18n" {
  export interface DefineLocaleMessage extends EnMessages {}
}

declare module "@intlify/core" {
  export interface DefineCoreLocaleMessage extends EnMessages {}
}
