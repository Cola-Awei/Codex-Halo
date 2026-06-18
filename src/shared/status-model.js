export const STATUS_DEFINITIONS = {
  waiting: { key: 'waiting', zh: '等待', en: 'Waiting', hint: '等待输入' },
  thinking: { key: 'thinking', zh: '思考', en: 'Thinking', hint: '正在推理' },
  done: { key: 'done', zh: '完成', en: 'Done', hint: '任务完成' },
};

export const STATE_KEYS = ['waiting', 'thinking', 'done'];

export function normalizeState(value) {
  return STATE_KEYS.includes(value) ? value : 'waiting';
}

export function getStatus(value) {
  return STATUS_DEFINITIONS[normalizeState(value)];
}
