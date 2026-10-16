<script setup lang="ts" generic="A extends readonly string[]">
import { defineModel, defineProps } from "vue";
import type { TranslationJsonObjects } from "~/utils/util";

const model = defineModel<A[number]>();
defineProps<{
  options: A;
  langKey?: TranslationJsonObjects<A[number]>;
  display?: (key: A[number]) => string;
}>();
</script>

<template>
  <select v-model="model">
    <option v-for="option in options" :key="option" :value="option">
      {{
        display
          ? display(option)
          : langKey
            ? $t(`${langKey}.${option}`)
            : option
      }}
    </option>
  </select>
</template>
