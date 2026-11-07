export const DECIMALS = 2;
export const NUMBER_FORMAT = { maximumFractionDigits: DECIMALS };
export const METRIC_PREFIXES = [
  "",
  "K",
  "M",
  "G",
  "T",
  "P",
  "E",
  "Z",
  "Y",
  "R",
  "Q",
] as const;

export type MetricPrefix = (typeof METRIC_PREFIXES)[number];

export function formatMetric(value: number) {
  const { $i18n } = useNuxtApp();
  let prefixIndex = 0;
  while (prefixIndex < METRIC_PREFIXES.length - 1 && value >= 1000) {
    prefixIndex++;
    value /= 1000;
  }
  return `${$i18n.n(value, NUMBER_FORMAT)} ${METRIC_PREFIXES[prefixIndex]}`;
}

// https://github.com/iohzrd/ratum/blob/b9ea9f605eba9ba5c7642aff1ceafa5ce4b8f62d/gateway/src/difficulty.rs#L126-L140
export function formatDifficulty(diff: number) {
  diff *= 2 ** 32;

  if (diff < 1000) {
    return `${diff.toFixed(0)}`;
  }

  const suffixes = "kMGTPEZYRQ";
  let suffix = 0;

  diff /= 1000;
  while (diff >= 999.95 && suffix < suffixes.length) {
    diff /= 1000;
    suffix++;
  }
  return `${diff.toFixed(1)}${suffixes[suffix]}`;
}

export function fromMetric(mantissa: number, exponent: MetricPrefix) {
  return mantissa * Math.pow(1000, METRIC_PREFIXES.indexOf(exponent));
}
