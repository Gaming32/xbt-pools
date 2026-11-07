<script setup lang="ts">
import { COIN, type BitcoinUnit } from "#shared/common";
import { useSatsSymbol } from "~/composables/useSatsSymbol";

defineProps<{
  sats: number;
  unit: BitcoinUnit;
}>();

useSatsSymbol();
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
