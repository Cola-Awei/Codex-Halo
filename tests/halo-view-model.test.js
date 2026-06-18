import test from 'node:test';
import assert from 'node:assert/strict';
import { getHaloViewState } from '../src/renderer/halo-view-model.js';

test('maps waiting state to centered text and calm halo class', () => {
  assert.deepEqual(getHaloViewState('waiting'), {
    key: 'waiting',
    zh: '等待',
    en: 'Waiting',
    hint: '等待输入',
    className: 'state-waiting',
  });
});

test('maps unknown state to waiting view state', () => {
  assert.equal(getHaloViewState('unknown').key, 'waiting');
});
