import {
  fetchBlockFees,
  fetchBlockTipHeight,
  type BlockFeesResponse,
} from "#shared/mempool";
import { CLIENT_POOL_FETCHERS, fetchSomePools } from "#shared/pools";
import type { LocationQuery } from "vue-router";

export function queryUnionRef<A extends readonly string[]>(
  key: string,
  options: A,
  initial: A[number],
): Ref<A[number]> {
  const route = useRoute();
  const router = useRouter();
  const result = ref(queryParamToUnion(route.query[key], initial, options));
  watch(result, (newValue) =>
    router.push({ query: { ...route.query, [key]: newValue } }),
  );
  return result;
}

export function queryParamToUnion<A extends readonly string[]>(
  value: LocationQuery[string] | undefined,
  fallback: A[number],
  options: A,
): A[number] {
  if (value instanceof Array) {
    value = value[0]!;
  }
  if (value && options.includes(value)) {
    return value;
  }
  return fallback;
}

export function formatMetric(value: number, fractionDigits?: number) {
  const prefixes = ["", "K", "M", "G", "T", "P", "E", "Z", "Y", "R", "Q"];
  let prefixIndex = 0;
  while (prefixIndex < prefixes.length - 1 && value >= 2000) {
    prefixIndex++;
    value /= 1000;
  }
  return `${value.toLocaleString(undefined, { maximumFractionDigits: fractionDigits })} ${prefixes[prefixIndex]}`;
}

export async function fetchAllData() {
  async function fetchAllBlockFees<
    A extends readonly Parameters<typeof fetchBlockFees>[0][],
  >(periods: A): Promise<Record<A[number], BlockFeesResponse>> {
    const entries = await Promise.all(
      periods.map((period) =>
        fetchBlockFees(period).then((fees) => [period, fees]),
      ),
    );
    return Object.fromEntries(entries);
  }

  const [serverPools, clientPools, tipHeight, blockFees] = await Promise.all([
    $fetch("/api/server-pools"),
    fetchSomePools(CLIENT_POOL_FETCHERS),
    fetchBlockTipHeight(),
    fetchAllBlockFees(["24h", "1w", "3y"]),
  ]);
  return {
    pools: { ...serverPools, ...clientPools },
    nextBlockHeight: +tipHeight + 1,
    blockFees,
  };
}
