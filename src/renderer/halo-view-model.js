import { getStatus } from '../shared/status-model.js';

export function getHaloViewState(value) {
  const status = getStatus(value);
  return {
    key: status.key,
    zh: status.zh,
    en: status.en,
    hint: status.hint,
    className: `state-${status.key}`,
  };
}
