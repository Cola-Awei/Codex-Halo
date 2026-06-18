import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWindowOptions } from '../src/main/window-config.js';

test('builds a transparent frameless always-on-top floating window hidden from taskbar', () => {
  const options = buildWindowOptions();
  assert.equal(options.width, 300);
  assert.equal(options.height, 300);
  assert.equal(options.frame, false);
  assert.equal(options.transparent, true);
  assert.equal(options.alwaysOnTop, true);
  assert.equal(options.resizable, false);
  assert.equal(options.skipTaskbar, true);
  assert.equal(options.backgroundColor, '#00000000');
});

test('builds window dimensions from requested halo scale', () => {
  assert.equal(buildWindowOptions('10').width, 160);
  assert.equal(buildWindowOptions('60').height, 540);
  assert.equal(buildWindowOptions('unknown').width, 300);
});
