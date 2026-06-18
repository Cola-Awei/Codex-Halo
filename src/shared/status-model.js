export const STATUS_DEFINITIONS = {
  idle: { key: 'idle', zh: '待命', en: 'Idle', hint: '等待输入' },
  thinking: { key: 'thinking', zh: '思考', en: 'Thinking', hint: '正在推理' },
  running: { key: 'running', zh: '执行', en: 'Running', hint: '正在执行' },
  waiting: { key: 'waiting', zh: '等待', en: 'Waiting', hint: '等待确认' },
  done: { key: 'done', zh: '完成', en: 'Done', hint: '任务完成' },
};

export const STATE_KEYS = ['idle', 'thinking', 'running', 'waiting', 'done'];

export function normalizeState(value) {
  return STATE_KEYS.includes(value) ? value : 'idle';
}

export function getStatus(value) {
  return STATUS_DEFINITIONS[normalizeState(value)];
}

export function nextState(value) {
  const normalized = normalizeState(value);
  const index = STATE_KEYS.indexOf(normalized);
  return STATE_KEYS[(index + 1) % STATE_KEYS.length];
}
