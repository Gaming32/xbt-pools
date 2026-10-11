<script setup lang="ts">
import { COIN, type BitcoinUnit } from "#shared/common";

defineProps<{
  sats: number;
  unit: BitcoinUnit;
}>();

useScript("https://kit.fontawesome.com/090ca49637.js");
</script>

<template>
  <template v-if="unit === 'btc'"
    >₿{{
      $n(sats / COIN, {
        minimumFractionDigits: 8,
        maximumFractionDigits: 8,
      })
    }}</template
  >
  <template v-else-if="unit === 'sat'"
    >{{ $n(sats, { maximumFractionDigits: 0 }) }}<i class="fak fa-regular"
  /></template>
</template>
