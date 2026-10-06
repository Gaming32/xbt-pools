<script setup lang="ts">
const model = defineModel();
defineProps<{
  options: readonly string[];
}>();
</script>

<template>
  <select v-model="model">
    <option v-for="option in options" :key="option">{{ option }}</option>
  </select>
</template>
