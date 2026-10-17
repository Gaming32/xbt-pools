<script setup lang="ts">
import {
  BITCOIN_UNITS,
  HS_PER_THS,
  TIME_PERIODS,
  type BitcoinUnit,
  type TimePeriod,
} from "#shared/common";
import {
  BITCOIN_POOL_IDS,
  type BitcoinPool,
  type BitcoinPoolId,
  type PoolFetchResult,
} from "#shared/pools";
import type { Comparator } from "#shared/util";
import { VCodeBlock } from "@wdns/vue-code-block";
import { poolRevenuePerDay, type ComputedRevenuePerDay } from "~/revenue";

const theme = useTheme();

const SORT_OPTIONS = ["name", "revenue", "hashrate"] as const;
const SORT_DIRECTIONS = ["asc", "desc"] as const;

const { data, refresh, pending } = await useLazyAsyncData(
  "homeData",
  fetchAllData,
  { server: false },
);

const averagingPeriod = useState<TimePeriod>("timePeriod", () => "1w");
const units = useState<BitcoinUnit>("units", () => "btc");

const sortOption = queryUnionRef("sort", SORT_OPTIONS, "revenue");
const sortDirection = queryUnionRef("dir", SORT_DIRECTIONS, "desc");

const yourHashrate = useState("yourHashrate", () => 1);
const yourHashrateMultiple = useState<MetricPrefix>(
  "yourHashrateMultiple",
  () => "T",
);

const sortedPools = computed(() => {
  if (data.value === undefined) {
    return [];
  }

  let baseComparator: Comparator<BitcoinPool>;
  switch (sortOption.value) {
    case "name":
      baseComparator = (a, b) => a.info.name.localeCompare(b.info.name);
      break;
    case "hashrate":
      baseComparator = (a, b) => a.hashrateHS - b.hashrateHS;
      break;
    case "revenue":
      baseComparator = (a, b) =>
        poolRevenuePerDay(a).revenue - poolRevenuePerDay(b).revenue;
      break;
  }

  let directionComparator: Comparator<BitcoinPool>;
  switch (sortDirection.value) {
    case "asc":
      directionComparator = baseComparator;
      break;
    case "desc":
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

const averageBlockFee = computed(() => {
  if (!data.value) {
    return 0;
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
  return blockFees.reduce(
    (sum, fees) => sum + fees.avgFees / blockFees.length,
    0,
  );
});

const yourHashrateCalculated = computed(() =>
  typeof yourHashrate.value === "number"
    ? fromMetric(yourHashrate.value, yourHashrateMultiple.value)
    : HS_PER_THS,
);

const poolRevenue = computed(() => {
  if (!data.value) {
    return {};
  }
  const result: Partial<Record<BitcoinPoolId, ComputedRevenuePerDay>> = {};
  for (const poolId of BITCOIN_POOL_IDS) {
    const pool = data.value.pools[poolId];
    if ("fetchError" in pool) {
      continue;
    }
    result[poolId] = poolRevenuePerDay(pool, {
      nextBlockHeight: data.value.nextBlockHeight,
      luckPeriod: averagingPeriod.value,
      hashrateHS: yourHashrateCalculated.value,
      blockFee: averageBlockFee.value,
    });
  }
  return result;
});

const poolDifficulty = Object.fromEntries(
  BITCOIN_POOL_IDS.map((id) => [id, ref()]),
) as Record<BitcoinPoolId, Ref<number | undefined>>;
watch(data, () => {
  if (!data.value) return;
  for (const poolId of BITCOIN_POOL_IDS) {
    if (!poolDifficulty[poolId].value) {
      const pool = data.value.pools[poolId];
      if ("fetchError" in pool) continue;
      poolDifficulty[poolId].value = Object.keys(
        pool.connectInfo.poolPortsByDifficulty,
      )
        .map(Number)
        .find((d) => d >= 1024);
    }
  }
});
</script>

<template>
  <div>
    <div>
      <SimpleSelect
        v-model="units"
        :options="BITCOIN_UNITS"
        lang-key="bitcoinUnits"
      />
      &thinsp;
      <SimpleSelect
        v-model="averagingPeriod"
        :options="TIME_PERIODS"
        lang-key="timePeriods"
      />
      &thinsp;
      <span v-if="averagingPeriod === 'all'" class="warning">{{
        $t("allTimeWarning")
      }}</span>
    </div>
    <div>
      <SimpleSelect
        v-model="sortOption"
        :options="SORT_OPTIONS"
        lang-key="sort.option"
      />
      &thinsp;
      <SimpleSelect
        v-model="sortDirection"
        :options="SORT_DIRECTIONS"
        lang-key="sort.direction"
      />
      &thinsp;
      <button class="refresh-button" @click="refresh()">
        <Icon
          name="i-lucide-refresh-cw"
          :class="{ spinning: data && pending }"
        />
      </button>
    </div>
    <div>
      <i18n-t keypath="yourHashrate">
        <template #input>
          <input v-model="yourHashrate" type="number" />
          &thinsp;
          <SimpleSelect
            v-model="yourHashrateMultiple"
            :options="METRIC_PREFIXES"
            :display="(prefix) => prefix + 'H/s'"
          />
        </template>
      </i18n-t>
    </div>
    <div v-if="data" class="pool-table">
      <div v-for="pool in sortedPools" :key="pool.info.name" class="pool-row">
        <a :href="pool.info.homepage" target="_blank">{{ pool.info.name }}</a>
        <template v-if="'fetchError' in pool">{{
          formatServerError(pool.fetchError)
        }}</template>
        <template v-else>
          <span :title="`${$n(pool.hashrateHS)} H/s`">
            {{ formatMetric(pool.hashrateHS) }}H/s
          </span>
          <span
            ><BitcoinAmount
              :sats="poolRevenue[pool.id]!.revenue"
              :unit="units"
            />/{{ $t("perDay") }}</span
          >
          <details>
            <summary>{{ $t("math.title") }}</summary>
            <div class="math-info-body">
              <span
                ><i18n-t keypath="math.blocksPerDay"
                  ><span class="value">{{
                    $n(poolRevenue[pool.id]!.blocksPerDay, NUMBER_FORMAT)
                  }}</span></i18n-t
                ></span
              >
              <span
                ><span class="value">&lowast; </span>
                <i18n-t keypath="math.poolShare"
                  ><span class="value"
                    >{{ formatMetric(yourHashrateCalculated) }}H/s /
                    {{
                      formatMetric(pool.hashrateHS + yourHashrateCalculated)
                    }}H/s &asymp;
                    {{
                      $n(
                        (yourHashrateCalculated /
                          (pool.hashrateHS + yourHashrateCalculated)) *
                          100,
                        NUMBER_FORMAT,
                      )
                    }}%</span
                  ></i18n-t
                ></span
              >
              <span
                ><span class="value">&lowast; (</span>
                <i18n-t keypath="math.blockSubsidy"
                  ><span class="value"
                    ><BitcoinAmount
                      :sats="poolRevenue[pool.id]!.blockSubsidy"
                      :unit="units" /></span></i18n-t
                ><span class="value"> + </span
                ><i18n-t keypath="math.blockFee"
                  ><span class="value"
                    ><BitcoinAmount
                      :sats="averageBlockFee"
                      :unit="units" /></span></i18n-t
                ><span class="value">)</span></span
              >
              <span
                v-if="pool.feeMultiple && pool.stratumSkimMultiple"
                class="value"
                >&lowast; (
              </span>
              <span
                v-if="pool.feeMultiple"
                :class="{ negative: true, grouped: pool.stratumSkimMultiple }"
                ><span v-if="!pool.stratumSkimMultiple" class="value"
                  >&lowast; (</span
                ><span class="value"
                  >{{ $n(100, NUMBER_FORMAT) }}% &minus;
                </span>
                <i18n-t keypath="math.fee"
                  ><span class="value"
                    >{{ $n(pool.feeMultiple * 100, NUMBER_FORMAT) }}%</span
                  ></i18n-t
                ><span v-if="!pool.stratumSkimMultiple" class="value"
                  >)</span
                ></span
              >
              <span
                v-if="pool.stratumSkimMultiple"
                :class="{ positive: true, grouped: pool.feeMultiple }"
                ><span v-if="!pool.feeMultiple" class="value"
                  >&lowast; ({{ $n(100, NUMBER_FORMAT) }}% + </span
                ><span v-else>+ </span>
                <i18n-t keypath="math.stratumHashrate"
                  ><span class="value"
                    >{{
                      $n(pool.stratumHashrateMultiple * 100, NUMBER_FORMAT)
                    }}%</span
                  ></i18n-t
                ><span class="value"> &lowast; </span
                ><i18n-t
                  tag="span"
                  class="explainer"
                  :title="$t('math.skimExplanation')"
                  keypath="math.stratumSkim"
                  ><span class="value"
                    >{{
                      $n(pool.stratumSkimMultiple * 100, NUMBER_FORMAT)
                    }}%</span
                  ></i18n-t
                ><span v-if="!pool.feeMultiple" class="value">)</span></span
              >
              <span
                v-if="pool.feeMultiple && pool.stratumSkimMultiple"
                class="value"
                >)</span
              >
            </div>
          </details>
          <details class="connect-info">
            <summary>{{ $t("connectInfo.title") }}</summary>
            <div class="connect-info-body">
              <div>
                Difficulty:
                <select v-model="poolDifficulty[pool.id].value">
                  <option
                    v-for="(_, difficulty) in pool.connectInfo
                      .poolPortsByDifficulty"
                    :key="difficulty"
                    :value="+difficulty"
                  >
                    {{ difficulty }}
                  </option>
                </select>
              </div>
              <span v-if="pool.connectInfo.requireV3" class="warning"
                ><i18n-t keypath="connectInfo.protocolV3Warning"
                  ><template #protocolV3
                    ><code>protocol_v3</code></template
                  ></i18n-t
                ></span
              >
              <VCodeBlock
                highlightjs
                lang="json"
                :theme="
                  theme.current.value.dark
                    ? 'base16-google-dark'
                    : 'base16-google-light'
                "
                :code="`{
  &quot;datum&quot;: {
    &quot;pool_host&quot;: ${JSON.stringify(pool.connectInfo.poolHost)},
    &quot;pool_port&quot;: ${
      pool.connectInfo.poolPortsByDifficulty[poolDifficulty[pool.id].value!]
    },
    &quot;pool_pubkey&quot;: ${JSON.stringify(pool.connectInfo.poolPubkey)}\
${pool.connectInfo.requireV3 ? `,\n    &quot;protocol_v3&quot;: true // ${$t('connectInfo.protocolV3Comment')}` : ''}
  }
}`"
              />
            </div>
          </details>
        </template>
      </div>
    </div>
    <div v-else>{{ $t("loading") }}</div>
  </div>
</template>

<style lang="css" scoped>
.error {
  color: red;
}

.warning {
  color: orange;
}

.pool-table {
  margin-top: 0.5rem;
  display: grid;
  grid-template-columns: max-content;
  row-gap: 1rem;

  .pool-row {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    border: 3px solid orange;
    border-radius: 10px;

    .math-info-body {
      padding-left: 1rem;
      display: flex;
      flex-direction: column;
      font-size: smaller;

      .value {
        font-size: larger;
      }

      .grouped {
        padding-left: 1rem;
      }

      .positive {
        color: green;
      }

      .negative {
        color: red;
      }
    }

    .connect-info {
      max-width: 50vw;

      .connect-info-body {
        padding-left: 1rem;
      }
    }
  }
}

.explainer {
  text-decoration: underline dotted;
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
