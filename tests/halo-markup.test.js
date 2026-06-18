import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../src/renderer/index.html', import.meta.url), 'utf8');

test('renders the halo ring as rounded svg stroke arcs', () => {
  assert.match(html, /<svg[^>]+class="halo-ring"/);
  assert.match(html, /class="halo-arc halo-arc-main"/);
  assert.doesNotMatch(html, /halo-arc-highlight/);
  assert.doesNotMatch(html, /<div class="halo-ring"/);
});
