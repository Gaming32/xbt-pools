<script setup lang="ts">
import {
  BITCOIN_POOL_IDS,
  type BitcoinPool,
  type BitcoinPoolId,
  type PoolFetchResult,
} from "#shared/pools";
import type { Comparator } from "#shared/util";
import { poolRevenuePerDay } from "~/revenue";
import { fetchAllData, formatMetric, queryUnionRef } from "~/util";
import { HS_PER_THS, type TimePeriod } from "~~/shared/common";

const BITCOIN_UNITS = ["Bitcoin", "Satoshis"] as const;
const SORT_OPTIONS = ["Alphabetic", "Revenue", "Hashrate"] as const;
const SORT_DIRECTIONS = ["Asc", "Dec"] as const;

const { data, refresh, pending } = await useLazyAsyncData(
  "homeData",
  fetchAllData,
  { server: false },
);

const averagingPeriod = useState<TimePeriod>("timePeriod", () => "1w");
const units = useState<(typeof BITCOIN_UNITS)[number]>(
  "units",
  () => "Bitcoin",
);
const sortOption = queryUnionRef("sort", SORT_OPTIONS, "Revenue");
const sortDirection = queryUnionRef("dir", SORT_DIRECTIONS, "Dec");

const sortedPools = computed(() => {
  if (data.value === undefined) {
    return [];
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

  return Object.entries(data.value.pools)
    .map(([id, pool]) => ({ id: id as BitcoinPoolId, ...pool }))
    .sort(comparator);
});

const poolRevenue = computed(() => {
  if (data.value === undefined) {
    return {};
  }

  const FEE_PERIOD_MAPPING: Record<
    TimePeriod,
    keyof Awaited<ReturnType<typeof fetchAllData>>["blockFees"]
  > = {
    "24h": "24h",
    "1w": "1w",
    all: "3y",
  };
  const blockFees =
    data.value.blockFees[FEE_PERIOD_MAPPING[averagingPeriod.value]];
  const averageBlockFee = blockFees.reduce(
    (sum, fees) => sum + fees.avgFees / blockFees.length,
    0,
  );

  const result: Partial<Record<BitcoinPoolId, number>> = {};
  for (const poolId of BITCOIN_POOL_IDS) {
    const pool = data.value.pools[poolId];
    if ("fetchError" in pool) {
      continue;
    }
    result[poolId] = poolRevenuePerDay(pool, {
      nextBlockHeight: data.value.nextBlockHeight,
      luckPeriod: averagingPeriod.value,
      hashrateHS: HS_PER_THS,
      blockFee: averageBlockFee,
    });
  }
  return result;
});
</script>

<template>
  <div>
    <div>
      <SimpleSelect v-model="units" :options="BITCOIN_UNITS" />
    </div>
    <div>
      <SimpleSelect v-model="sortOption" :options="SORT_OPTIONS" />
      &thinsp;
      <SimpleSelect v-model="sortDirection" :options="SORT_DIRECTIONS" />
      &thinsp;
      <button @click="refresh()" class="refresh-button">
        <Icon
          name="i-lucide-refresh-cw"
          :class="{ spinning: data && pending }"
        />
      </button>
    </div>
    <div v-if="data" class="pool-table">
      <div v-for="pool in sortedPools" :key="pool.info.name" class="pool-row">
        <a :href="pool.info.homepage" target="_blank">{{ pool.info.name }}</a>
        <br />
        <template v-if="'fetchError' in pool">{{ pool.fetchError }}</template>
        <template v-else>
          <span :title="`${pool.hashrateHS.toLocaleString()} H/s`">
            {{ formatMetric(pool.hashrateHS, 2) }}H/s
          </span>
          <br />
          <BitcoinAmount :sats="poolRevenue[pool.id]!" :unit="units" />/TH/day
        </template>
      </div>
    </div>
    <div v-else>Loading...</div>
  </div>
</template>

<style lang="css" scoped>
.error {
  color: red;
}

.pool-table {
  margin-top: 0.5rem;
  display: grid;
  grid-template-columns: max-content;
  row-gap: 1rem;

  .pool-row {
    display: inline-block;
    padding: 1rem;
    border: 3px solid orange;
    border-radius: 10px;
  }
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
