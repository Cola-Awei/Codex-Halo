import test from 'node:test';
import assert from 'node:assert/strict';
import { getHaloViewState } from '../src/renderer/halo-view-model.js';

test('maps thinking state to centered text and active halo class', () => {
  assert.deepEqual(getHaloViewState('thinking'), {
    key: 'thinking',
    zh: '思考',
    en: 'Thinking',
    hint: '正在思考',
    className: 'state-thinking',
  });
});

test('maps unknown state to thinking view state', () => {
  assert.equal(getHaloViewState('unknown').key, 'thinking');
});
