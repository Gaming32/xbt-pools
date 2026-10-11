<script setup lang="ts" generic="A extends readonly string[]">
import type { TranslationJsonObjects } from "~/utils/util";
import type { DefineLocaleMessage } from "vue-i18n";

const model = defineModel<A[number]>();
defineProps<{
  options: A;
  langKey?: TranslationJsonObjects<A[number]>;
}>();
</script>

<template>
  <select v-model="model">
    <option v-for="option in options" :key="option" :value="option">
      {{ langKey ? $t(`${langKey}.${option}`) : option }}
    </option>
  </select>
</template>
