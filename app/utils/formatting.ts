export const DECIMALS = 2;
export const NUMBER_FORMAT = { maximumFractionDigits: DECIMALS };

const METRIC_PREFIXES = ["", "K", "M", "G", "T", "P", "E", "Z", "Y", "R", "Q"];
export function formatMetric(value: number) {
  const { n } = useI18n();
  let prefixIndex = 0;
  while (prefixIndex < METRIC_PREFIXES.length - 1 && value >= 2000) {
    prefixIndex++;
    value /= 1000;
  }
  return `${n(value, NUMBER_FORMAT)} ${METRIC_PREFIXES[prefixIndex]}`;
}
