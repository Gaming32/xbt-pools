<script setup lang="ts">
import {
  poolRevenuePerDay,
  type BitcoinPool,
  type FetchedPools,
  type PoolFetchResult,
} from "#shared/pools";
import type { Comparator } from "#shared/util";
import { formatMetric, queryUnionRef } from "~/util";

const SORT_OPTIONS = ["Alphabetic", "Revenue", "Hashrate"] as const;
const SORT_DIRECTIONS = ["Asc", "Dec"] as const;

const {
  data: pools,
  refresh,
  pending,
} = await useFetch<FetchedPools>("/api/server-pools", {
  server: false,
  lazy: true,
});

const sortOption = queryUnionRef("sort", SORT_OPTIONS, "Revenue");
const sortDirection = queryUnionRef("dir", SORT_DIRECTIONS, "Dec");

const sortedPools = computed(() => {
  if (pools.value === undefined) {
    return undefined;
  }

  let baseComparator: Comparator<BitcoinPool>;
  switch (sortOption.value) {
    case "Alphabetic":
      baseComparator = (a, b) => a.info.name.localeCompare(b.info.name);
      break;
    case "Hashrate":
      baseComparator = (a, b) => a.hashrateHS - b.hashrateHS;
      break;
    case "Revenue":
      baseComparator = (a, b) => poolRevenuePerDay(a) - poolRevenuePerDay(b);
      break;
  }

  let directionComparator: Comparator<BitcoinPool>;
  switch (sortDirection.value) {
    case "Asc":
      directionComparator = baseComparator;
      break;
    case "Dec":
      directionComparator = (a, b) => baseComparator(b, a);
      break;
  }

  const comparator: Comparator<PoolFetchResult> = (a, b) => {
    const aError = "fetchError" in a;
    const bError = "fetchError" in b;
    if (aError) {
      if (bError) {
        return a.info.name.localeCompare(b.info.name);
      }
      return 1;
    }
    if (bError) {
      return -1;
    }
    return directionComparator(a, b);
  };

  return Object.values(pools.value).sort(comparator);
});
</script>

<template>
  <div>
    <div>
      <select v-model="sortOption">
        <option v-for="option in SORT_OPTIONS" :key="option">
          {{ option }}
        </option>
      </select>
      &thinsp;
      <select v-model="sortDirection">
        <option v-for="direction in SORT_DIRECTIONS" :key="direction">
          {{ direction }}
        </option>
      </select>
      &thinsp;
      <button @click="refresh()" class="refresh-button">
        <Icon
          name="i-lucide-refresh-cw"
          :class="{ spinning: pools && pending }"
        />
      </button>
    </div>
    <div v-if="pools">
      <ol>
        <li v-for="pool in sortedPools" :key="pool.info.name">
          <a :href="pool.info.homepage" target="_blank">{{ pool.info.name }}</a
          >:
          <span
            v-if="!('fetchError' in pool)"
            :title="`${pool.hashrateHS.toLocaleString()} H/s`"
          >
            {{ formatMetric(pool.hashrateHS, 2) }}H/s
          </span>
          <span v-else class="error">
            {{ pool.fetchError }}
          </span>
        </li>
      </ol>
    </div>
    <div v-else>Loading...</div>
  </div>
</template>

<style lang="css" scoped>
.error {
  color: red;
}

.refresh-button {
  vertical-align: middle;
  background-color: transparent;
  border: none;
  outline: none;
  font-size: medium;
  padding: 0;
}

.spinning {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
