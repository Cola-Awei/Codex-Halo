import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const mainSource = readFileSync(new URL('../src/main/main.js', import.meta.url), 'utf8');

test('creates a tray icon instead of relying on the taskbar', () => {
  assert.match(mainSource, /Tray/);
  assert.match(mainSource, /nativeImage/);
  assert.match(mainSource, /setToolTip\('Codex Halo'\)/);
  assert.match(mainSource, /createTray\(\)/);
});

test('hides the floating window instead of quitting when closed from the window menu', () => {
  assert.match(mainSource, /mainWindow\.hide\(\)/);
  assert.match(mainSource, /before-quit/);
});
