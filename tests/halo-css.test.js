import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/renderer/styles.css', import.meta.url), 'utf8');

function blockFor(selector) {
  const match = css.match(new RegExp(`${selector.replaceAll('.', '\\.')}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `Expected ${selector} block to exist`);
  return match[1];
}

test('keeps animation off the halo container so text does not rotate', () => {
  const haloBlock = blockFor('.halo');
  assert.doesNotMatch(haloBlock, /animation\s*:/);
  assert.doesNotMatch(haloBlock, /background:\s*conic-gradient/);
});

test('puts the conic gradient and animation on the outer ring only', () => {
  const ringBlock = blockFor('.halo-ring');
  assert.match(ringBlock, /background:\s*conic-gradient/);
  assert.match(ringBlock, /animation:\s*halo-breathe/);
});

test('does not use native drag regions so right-click can open the app menu', () => {
  assert.doesNotMatch(css, /-webkit-app-region:\s*drag/);
});

test('does not keep removed state classes in the stylesheet', () => {
  assert.doesNotMatch(css, /state-idle|state-running/);
});
