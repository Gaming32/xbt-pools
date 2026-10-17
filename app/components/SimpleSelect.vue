<script setup lang="ts" generic="A extends readonly string[]">
import type { TranslationJsonObjects } from "~/utils/util";

const model = defineModel<A[number]>();
const props = defineProps<{
  options: A;
  label?: string;
  langKey?: TranslationJsonObjects<A[number]>;
  display?: (key: A[number]) => string;
}>();

const { t } = useI18n();

const items = computed(() =>
  props.options.map((option) => ({
    value: option,
    title: props.display
      ? props.display(option)
      : props.langKey
        ? t(`${props.langKey}.${option}`)
        : option,
  })),
);
</script>

<template>
  <v-select v-model="model" :items="items" :label="label" />
</template>
