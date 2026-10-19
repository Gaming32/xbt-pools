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
watch(yourHashrateMultiple, (newMultiple, oldMultiple) => {
  const trueValue = fromMetric(yourHashrate.value, oldMultiple);
  const newValue = toMetricWithMultiple(trueValue, newMultiple);
  yourHashrate.value = newValue;
});

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

type PoolWithId = BitcoinPool & { id: BitcoinPoolId };
type FetchResultWithId = PoolFetchResult & { id: BitcoinPoolId };

const sortedPools = computed(() => {
  if (!data.value) {
    return [];
  }

  let baseComparator: Comparator<PoolWithId>;
  switch (sortOption.value) {
    case "name":
      baseComparator = (a, b) => a.info.name.localeCompare(b.info.name);
      break;
    case "hashrate":
      baseComparator = (a, b) => a.hashrateHS - b.hashrateHS;
      break;
    case "revenue":
      baseComparator = (a, b) =>
        poolRevenue.value[a.id]!.revenue - poolRevenue.value[b.id]!.revenue;
      break;
  }

  let directionComparator: Comparator<PoolWithId>;
  switch (sortDirection.value) {
    case "asc":
      directionComparator = baseComparator;
      break;
    case "desc":
      directionComparator = (a, b) => baseComparator(b, a);
      break;
  }

  const comparator: Comparator<FetchResultWithId> = (a, b) => {
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

const bestRevenue = computed(() =>
  Math.max(0, ...Object.values(poolRevenue.value).map((r) => r.revenue)),
);
</script>

<template>
  <v-container class="py-6 py-md-10" max-width="1280">
    <v-card variant="flat" border class="mb-6">
      <v-card-text class="pa-4 pa-md-5">
        <v-row align="center">
          <v-col cols="12" md="4">
            <div class="d-flex ga-2">
              <v-text-field
                v-model.number="yourHashrate"
                type="number"
                min="0"
                :label="$t('yourHashrate')"
                prepend-inner-icon="lucide:cpu"
              />
              <SimpleSelect
                v-model="yourHashrateMultiple"
                class="prefix-select"
                :options="METRIC_PREFIXES"
                :display="(prefix) => prefix + 'H/s'"
              />
            </div>
          </v-col>
          <v-col cols="6" sm="3" md="2">
            <SimpleSelect
              v-model="units"
              :label="$t('controls.units')"
              :options="BITCOIN_UNITS"
              lang-key="bitcoinUnits"
            />
          </v-col>
          <v-col cols="6" sm="3" md="2">
            <SimpleSelect
              v-model="averagingPeriod"
              :label="$t('controls.averagingPeriod')"
              :options="TIME_PERIODS"
              lang-key="timePeriods"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <div class="d-flex align-center ga-2">
              <SimpleSelect
                v-model="sortOption"
                :label="$t('controls.sortBy')"
                :options="SORT_OPTIONS"
                lang-key="sort.option"
              />
              <v-btn-toggle
                v-model="sortDirection"
                mandatory
                divided
                variant="outlined"
                color="primary"
                density="comfortable"
                rounded="lg"
                class="sort-toggle"
              >
                <v-btn
                  v-for="direction in SORT_DIRECTIONS"
                  :key="direction"
                  :value="direction"
                  :title="$t(`sort.direction.${direction}`)"
                  :aria-label="$t(`sort.direction.${direction}`)"
                  :icon="
                    direction === 'asc'
                      ? 'lucide:arrow-up-narrow-wide'
                      : 'lucide:arrow-down-wide-narrow'
                  "
                />
              </v-btn-toggle>
              <v-btn
                icon="lucide:refresh-cw"
                variant="tonal"
                color="primary"
                rounded="lg"
                :title="$t('controls.refresh')"
                :aria-label="$t('controls.refresh')"
                :loading="data && pending"
                @click="refresh()"
              />
            </div>
          </v-col>
        </v-row>
        <v-expand-transition>
          <v-alert
            v-if="averagingPeriod === 'all'"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-4"
            :text="$t('allTimeWarning')"
          />
        </v-expand-transition>
      </v-card-text>
    </v-card>

    <v-row v-if="data">
      <v-col
        v-for="pool in sortedPools"
        :key="pool.info.name"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card variant="flat" border class="pool-card">
          <v-card-item>
            <v-card-title class="font-weight-bold">
              <a
                :href="pool.info.homepage"
                target="_blank"
                rel="noopener"
                class="pool-link"
                >{{ pool.info.name
                }}<v-icon
                  icon="lucide:external-link"
                  size="x-small"
                  class="ml-1 text-medium-emphasis"
              /></a>
            </v-card-title>
            <template v-if="!('fetchError' in pool)" #append>
              <v-chip
                size="small"
                variant="tonal"
                prepend-icon="lucide:gauge"
                :title="`${$n(pool.hashrateHS)} H/s`"
                >{{ formatMetric(pool.hashrateHS) }}H/s</v-chip
              >
            </template>
          </v-card-item>

          <v-card-text v-if="'fetchError' in pool">
            <v-alert
              type="error"
              variant="tonal"
              density="compact"
              :text="formatServerError(pool.fetchError)"
            />
          </v-card-text>
          <template v-else>
            <v-card-text class="pt-1">
              <div class="text-label-medium text-medium-emphasis">
                {{ $t("estimatedRevenue") }}
              </div>
              <div class="revenue text-primary">
                <BitcoinAmount
                  :sats="poolRevenue[pool.id]!.revenue"
                  :unit="units"
                />
                <span class="text-body-medium text-medium-emphasis">
                  / {{ $t("perDay") }}</span
                >
              </div>
              <v-progress-linear
                :model-value="
                  bestRevenue
                    ? (poolRevenue[pool.id]!.revenue / bestRevenue) * 100
                    : 0
                "
                color="primary"
                bg-color="primary"
                rounded
                height="6"
                class="my-3"
              />
              <div class="d-flex flex-column ga-2">
                <div class="d-flex flex-wrap ga-2">
                  <v-chip size="small" variant="outlined" label>{{
                    $t("math.fee", [
                      `${$n(pool.feeMultiple * 100, NUMBER_FORMAT)}%`,
                    ])
                  }}</v-chip>
                  <v-chip
                    v-if="pool.stratum.skimMultiple"
                    size="small"
                    variant="tonal"
                    color="success"
                    label
                    :title="$t('math.skimExplanation')"
                    >{{
                      $t("math.stratumSkim", [
                        `${$n(pool.stratum.skimMultiple * 100, NUMBER_FORMAT)}%`,
                      ])
                    }}</v-chip
                  >
                </div>
                <div class="d-flex flex-wrap ga-2">
                  <v-chip
                    size="small"
                    variant="tonal"
                    label
                    :color="
                      pool.stratum.availability === 'none'
                        ? 'success'
                        : pool.stratum.availability === 'enforced_failover' ||
                            pool.stratum.feeMultiple === 1
                          ? 'warning'
                          : 'error'
                    "
                    >{{
                      $t(`stratumAvailability.${pool.stratum.availability}`, [
                        $n(pool.stratum.feeMultiple * 100, NUMBER_FORMAT) + "%",
                      ])
                    }}</v-chip
                  >
                </div>
              </div>
            </v-card-text>

            <v-expansion-panels
              variant="accordion"
              flat
              static
              multiple
              class="pool-panels"
            >
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon
                    icon="lucide:calculator"
                    size="small"
                    class="mr-3 text-medium-emphasis"
                  />{{ $t("math.title") }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
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
                            formatMetric(
                              pool.hashrateHS + yourHashrateCalculated,
                            )
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
                      v-if="pool.feeMultiple && pool.stratum.skimMultiple"
                      class="value"
                      >&lowast; (
                    </span>
                    <span
                      v-if="pool.feeMultiple"
                      :class="{
                        negative: true,
                        grouped: pool.stratum.skimMultiple,
                      }"
                      ><span v-if="!pool.stratum.skimMultiple" class="value"
                        >&lowast; (</span
                      ><span class="value"
                        >{{ $n(100, NUMBER_FORMAT) }}% &minus;
                      </span>
                      <i18n-t keypath="math.fee"
                        ><span class="value"
                          >{{
                            $n(pool.feeMultiple * 100, NUMBER_FORMAT)
                          }}%</span
                        ></i18n-t
                      ><span v-if="!pool.stratum.skimMultiple" class="value"
                        >)</span
                      ></span
                    >
                    <span
                      v-if="pool.stratum.skimMultiple"
                      :class="{ positive: true, grouped: pool.feeMultiple }"
                      ><span v-if="!pool.feeMultiple" class="value"
                        >&lowast; ({{ $n(100, NUMBER_FORMAT) }}% + </span
                      ><span v-else>+ </span>
                      <i18n-t keypath="math.stratumHashrate"
                        ><span class="value"
                          >{{
                            $n(
                              pool.stratum.hashrateMultiple * 100,
                              NUMBER_FORMAT,
                            )
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
                            $n(pool.stratum.skimMultiple * 100, NUMBER_FORMAT)
                          }}%</span
                        ></i18n-t
                      ><span v-if="!pool.feeMultiple" class="value"
                        >)</span
                      ></span
                    >
                    <span
                      v-if="pool.feeMultiple && pool.stratum.skimMultiple"
                      class="value"
                      >)</span
                    >
                    <v-divider class="my-2" />
                    <span class="font-weight-bold"
                      >&asymp;
                      <BitcoinAmount
                        :sats="poolRevenue[pool.id]!.revenue"
                        :unit="units"
                      />
                      / {{ $t("perDay") }}</span
                    >
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
              <v-expansion-panel eager>
                <v-expansion-panel-title>
                  <v-icon
                    icon="lucide:plug"
                    size="small"
                    class="mr-3 text-medium-emphasis"
                  />{{ $t("connectInfo.title") }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-select
                    v-model="poolDifficulty[pool.id].value"
                    :label="$t('connectInfo.difficulty')"
                    :items="
                      Object.keys(pool.connectInfo.poolPortsByDifficulty).map(
                        Number,
                      )
                    "
                    density="compact"
                    class="mb-3"
                  />
                  <v-alert
                    v-if="pool.connectInfo.requireV3"
                    type="warning"
                    variant="tonal"
                    density="compact"
                    class="mb-3 text-body-medium"
                    ><i18n-t keypath="connectInfo.protocolV3Warning"
                      ><template #protocolV3
                        ><code>protocol_v3</code></template
                      ></i18n-t
                    ></v-alert
                  >
                  <VCodeBlock
                    class="code-block"
                    highlightjs
                    lang="json5"
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
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </template>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col
        v-for="n in BITCOIN_POOL_IDS.length"
        :key="n"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card variant="flat" border>
          <!-- VSkeletonLoader sets its own label as `ariaLabel`, which SSR renders as an invalid `arialabel` attribute -->
          <v-skeleton-loader
            type="heading, subtitle, text, chip"
            :aria-label="$t('$vuetify.loading')"
          />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="css" scoped>
.prefix-select {
  flex: 0 0 7.5rem;
}

.sort-toggle {
  height: 48px;
  flex-shrink: 0;
}

.pool-card {
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.6) !important;
    box-shadow: 0 4px 20px rgba(var(--v-theme-primary), 0.08);
  }
}

.pool-link {
  color: inherit;
  text-decoration: none;

  &:hover {
    color: rgb(var(--v-theme-primary));
  }
}

.revenue {
  font-size: 1.6rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

.pool-panels {
  border-top: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 0;

  :deep(.v-expansion-panel) {
    background: transparent;
  }
}

.math-info-body {
  display: flex;
  flex-direction: column;
  row-gap: 0.15rem;
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));

  .value {
    font-size: 0.95rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: rgb(var(--v-theme-on-surface));
  }

  .grouped {
    padding-left: 1rem;
  }

  .positive,
  .positive .value {
    color: rgb(var(--v-theme-success));
  }

  .negative,
  .negative .value {
    color: rgb(var(--v-theme-error));
  }
}

.code-block {
  overflow-x: auto;
  font-size: 0.8rem;
}

.explainer {
  text-decoration: underline dotted;
  cursor: help;
}
</style>
