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
  const { n } = useI18n();
  let prefixIndex = 0;
  while (prefixIndex < METRIC_PREFIXES.length - 1 && value >= 1000) {
    prefixIndex++;
    value /= 1000;
  }
  return `${n(value, NUMBER_FORMAT)} ${METRIC_PREFIXES[prefixIndex]}`;
}

export function fromMetric(mantissa: number, exponent: MetricPrefix) {
  return mantissa * Math.pow(1000, METRIC_PREFIXES.indexOf(exponent));
}
