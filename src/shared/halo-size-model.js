export const DEFAULT_HALO_PERCENT = 30;
export const MIN_HALO_PERCENT = 0;
export const MAX_HALO_PERCENT = 100;
export const MIN_WINDOW_SIZE = 120;
export const WINDOW_PADDING = 40;
export const PIXELS_PER_PERCENT = 6;

export function normalizeHaloPercent(value) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return DEFAULT_HALO_PERCENT;
  return Math.min(MAX_HALO_PERCENT, Math.max(MIN_HALO_PERCENT, Math.round(numberValue)));
}

export function getHaloSizeFromPercent(value) {
  const percent = normalizeHaloPercent(value);
  const windowSize = MIN_WINDOW_SIZE + percent * PIXELS_PER_PERCENT;
  return {
    percent,
    windowSize,
    haloSize: windowSize - WINDOW_PADDING,
  };
}
