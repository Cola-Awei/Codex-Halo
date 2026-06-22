import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_HALO_PERCENT,
  getHaloSizeFromPercent,
  normalizeHaloPercent,
} from '../src/main/halo-size-model.js';

test('normalizes halo size percentage to the 0-100 range', () => {
  assert.equal(normalizeHaloPercent(-20), 0);
  assert.equal(normalizeHaloPercent(42.7), 43);
  assert.equal(normalizeHaloPercent(1000), 100);
  assert.equal(normalizeHaloPercent('bad'), DEFAULT_HALO_PERCENT);
});

test('maps percentage values to real square window sizes', () => {
  assert.equal(getHaloSizeFromPercent(0).windowSize, 120);
  assert.equal(getHaloSizeFromPercent(30).windowSize, 300);
  assert.equal(getHaloSizeFromPercent(100).windowSize, 720);
});
