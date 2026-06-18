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

test('animates the svg halo ring only', () => {
  const ringBlock = blockFor('.halo-ring');
  assert.match(ringBlock, /animation:\s*halo-spin/);
});

test('keeps ring rotation continuous while state colors transition', () => {
  const arcBlock = blockFor('.halo-arc');
  const thinkingBlock = blockFor('.state-thinking');
  const doneBlock = blockFor('.state-done');
  assert.match(arcBlock, /transition:\s*stroke/);
  assert.doesNotMatch(thinkingBlock, /--spin-speed/);
  assert.doesNotMatch(doneBlock, /--spin-speed/);
});

test('does not use native drag regions so right-click can open the app menu', () => {
  assert.doesNotMatch(css, /-webkit-app-region:\s*drag/);
});

test('does not keep removed state classes in the stylesheet', () => {
  assert.doesNotMatch(css, /state-idle|state-running|state-waiting/);
  assert.doesNotMatch(css, /halo-size-small|halo-size-medium|halo-size-large/);
});

test('defines numeric halo scale classes', () => {
  for (const scale of ['10', '20', '30', '40', '50', '60']) {
    assert.match(css, new RegExp(`\\.halo-scale-${scale}\\s*\\{`));
  }
});

test('uses a rounded svg stroke c-shaped glow ring', () => {
  const arcBlock = blockFor('.halo-arc-main');
  const ringBlock = blockFor('.halo-ring');
  assert.match(arcBlock, /stroke-linecap:\s*round/);
  assert.match(arcBlock, /stroke-dasharray:\s*205 252/);
  assert.doesNotMatch(css, /halo-arc-highlight/);
  assert.doesNotMatch(ringBlock, /drop-shadow\(0 0/);
  assert.doesNotMatch(css, /conic-gradient|repeating-conic-gradient|border-style:\s*dashed|reverse-spin|mask:\s*radial-gradient/);
});

test('shows only white center status text without a dark center disk', () => {
  const coreBlock = blockFor('.halo-core');
  const zhBlock = blockFor('.state-zh');
  const enBlock = blockFor('.state-en');
  const hintBlock = blockFor('.state-hint');

  assert.doesNotMatch(coreBlock, /background\s*:/);
  assert.match(zhBlock, /color:\s*#ffffff/);
  assert.match(enBlock, /display:\s*none/);
  assert.match(hintBlock, /display:\s*none/);
});
