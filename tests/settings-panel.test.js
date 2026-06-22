import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../src/renderer/settings.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/renderer/settings.css', import.meta.url), 'utf8');
const mainSource = readFileSync(new URL('../src/main/main.js', import.meta.url), 'utf8');

test('settings panel exposes a 0-100 slider instead of a text input', () => {
  assert.match(html, /type="range"/);
  assert.match(html, /min="0"/);
  assert.match(html, /max="100"/);
  assert.doesNotMatch(html, /type="text"|type="number"/);
});

test('settings panel is compact and does not reuse the oversized draft window', () => {
  assert.match(mainSource, /width:\s*320/);
  assert.match(mainSource, /height:\s*148/);
  assert.doesNotMatch(mainSource, /width:\s*360/);
  assert.doesNotMatch(mainSource, /height:\s*188/);
  assert.match(css, /width:\s*304px/);
  assert.match(css, /height:\s*132px/);
});
