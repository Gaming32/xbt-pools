export const TIME_PERIODS = ["24h", "1w", "all"] as const;
export type TimePeriod = (typeof TIME_PERIODS)[number];

/** 1 GH/s in H/s */
export const HS_PER_GHS = 1_000_000_000;
/** 1 TH/s in H/s */
export const HS_PER_THS = 1_000_000_000_000;

export const MULTIPLE_PER_BPS = 100_000;
