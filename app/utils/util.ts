import {
  fetchBlockFees,
  fetchBlockTipHeight,
  type BlockFeesResponse,
} from "#shared/mempool";
import { CLIENT_POOL_FETCHERS, fetchSomePools } from "#shared/pools";
import type { DefaultLocaleMessageSchema } from "vue-i18n";
import type { LocationQuery } from "vue-router";
import type { ServerError } from "~~/shared/common";

export type FlatJsonObjectPaths<
  T,
  RequiredFields extends string = string,
  Key extends keyof T = keyof T,
> = Key extends string
  ? T[Key] extends Record<RequiredFields, string>
    ? `${Key}`
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      T[Key] extends Record<string, any>
      ? `${Key}.${FlatJsonObjectPaths<T[Key], RequiredFields>}`
      : never
  : never;
export type TranslationJsonObjects<RequiredFields extends string = string> =
  FlatJsonObjectPaths<DefaultLocaleMessageSchema, RequiredFields>;

export const COOKIE_EXPIRY = 60 * 60 * 24 * 365;

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

export function formatServerError(error: ServerError) {
  const { t } = useI18n();
  return t(`serverError.${error.key}`, error.params);
}
