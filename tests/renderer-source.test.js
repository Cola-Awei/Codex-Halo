import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const renderer = readFileSync(new URL('../src/renderer/renderer.js', import.meta.url), 'utf8');

test('does not simulate Codex status with a local interval', () => {
  assert.doesNotMatch(renderer, /setInterval\s*\(/);
  assert.doesNotMatch(renderer, /nextState/);
});

test('applies fixed halo pixel size from size updates', () => {
  assert.match(renderer, /getHaloSizeFromPercent/);
  assert.match(renderer, /halo\.style\.setProperty\('--halo-size'/);
});
