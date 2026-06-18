import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STATE_KEYS,
  getStatus,
  normalizeState,
} from '../src/shared/status-model.js';

test('defines only the three approved Codex Halo states in order', () => {
  assert.deepEqual(STATE_KEYS, ['waiting', 'thinking', 'done']);
});

test('normalizes unknown states to waiting', () => {
  assert.equal(normalizeState('thinking'), 'thinking');
  assert.equal(normalizeState('missing'), 'waiting');
  assert.equal(normalizeState(undefined), 'waiting');
});

test('returns labels and hints for waiting', () => {
  assert.deepEqual(getStatus('waiting'), {
    key: 'waiting',
    zh: '等待',
    en: 'Waiting',
    hint: '等待输入',
  });
});
