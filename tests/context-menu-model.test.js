import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HALO_SIZE_OPTIONS,
  buildContextMenuTemplate,
  getHaloSizeOption,
} from '../src/main/context-menu-model.js';

test('defines three right-click size options', () => {
  assert.deepEqual(
    HALO_SIZE_OPTIONS.map((option) => [option.key, option.label, option.windowSize]),
    [
      ['small', '小号', 240],
      ['medium', '中号', 300],
      ['large', '大号', 380],
    ],
  );
});

test('falls back to medium size for unknown values', () => {
  assert.equal(getHaloSizeOption('missing').key, 'medium');
});

test('builds menu with size radio items and close command', () => {
  const template = buildContextMenuTemplate({
    currentSize: 'large',
    onSizeChange: () => {},
    onClose: () => {},
  });

  assert.deepEqual(
    template.map((item) => [item.label, item.type, item.checked ?? false]),
    [
      ['小号', 'radio', false],
      ['中号', 'radio', false],
      ['大号', 'radio', true],
      [undefined, 'separator', false],
      ['关闭悬浮栏', 'normal', false],
    ],
  );
});
