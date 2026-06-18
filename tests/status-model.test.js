import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STATE_KEYS,
  getStatus,
  normalizeState,
} from '../src/shared/status-model.js';

test('defines only the two approved Codex Halo states in order', () => {
  assert.deepEqual(STATE_KEYS, ['thinking', 'done']);
});

test('normalizes unknown states to thinking', () => {
  assert.equal(normalizeState('thinking'), 'thinking');
  assert.equal(normalizeState('missing'), 'thinking');
  assert.equal(normalizeState(undefined), 'thinking');
});

test('returns labels and hints for thinking', () => {
  assert.deepEqual(getStatus('thinking'), {
    key: 'thinking',
    zh: '思考',
    en: 'Thinking',
    hint: '正在思考',
  });
});
