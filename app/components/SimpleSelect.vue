<script setup lang="ts" generic="A extends readonly string[]">
const model = defineModel<A[number]>();
defineProps<{
  options: A;
}>();
</script>

<template>
  <select v-model="model">
    <option v-for="option in options" :key="option">{{ option }}</option>
  </select>
</template>
