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
