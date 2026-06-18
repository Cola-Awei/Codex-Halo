export const STATUS_DEFINITIONS = {
  thinking: { key: 'thinking', zh: '思考', en: 'Thinking', hint: '正在思考' },
  done: { key: 'done', zh: '完成', en: 'Done', hint: '任务完成' },
};

export const STATE_KEYS = ['thinking', 'done'];

export function normalizeState(value) {
  return STATE_KEYS.includes(value) ? value : 'thinking';
}

export function getStatus(value) {
  return STATUS_DEFINITIONS[normalizeState(value)];
}
