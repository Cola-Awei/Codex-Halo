import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STATE_KEYS,
  getStatus,
  normalizeState,
  nextState,
} from '../src/shared/status-model.js';

test('defines the five approved Codex Halo states in order', () => {
  assert.deepEqual(STATE_KEYS, ['idle', 'thinking', 'running', 'waiting', 'done']);
});

test('normalizes unknown states to idle', () => {
  assert.equal(normalizeState('thinking'), 'thinking');
  assert.equal(normalizeState('missing'), 'idle');
  assert.equal(normalizeState(undefined), 'idle');
});

test('returns labels and hints for idle', () => {
  assert.deepEqual(getStatus('idle'), {
    key: 'idle',
    zh: '待命',
    en: 'Idle',
    hint: '等待输入',
  });
});

test('cycles from done back to idle', () => {
  assert.equal(nextState('idle'), 'thinking');
  assert.equal(nextState('done'), 'idle');
  assert.equal(nextState('missing'), 'thinking');
});
