import test from 'node:test';
import assert from 'node:assert/strict';
import { getHaloViewState } from '../src/renderer/halo-view-model.js';

test('maps idle state to centered text and calm halo class', () => {
  assert.deepEqual(getHaloViewState('idle'), {
    key: 'idle',
    zh: '待命',
    en: 'Idle',
    hint: '等待输入',
    className: 'state-idle',
  });
});

test('maps unknown state to idle view state', () => {
  assert.equal(getHaloViewState('unknown').key, 'idle');
});
