import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HALO_SIZE_OPTIONS,
  buildContextMenuTemplate,
  buildTrayMenuTemplate,
  getHaloSizeOption,
} from '../src/main/context-menu-model.js';

test('defines numeric right-click scale options', () => {
  assert.deepEqual(
    HALO_SIZE_OPTIONS.map((option) => [option.key, option.label, option.windowSize]),
    [
      ['10', '10', 160],
      ['20', '20', 220],
      ['30', '30', 300],
      ['40', '40', 380],
      ['50', '50', 460],
      ['60', '60', 540],
    ],
  );
});

test('falls back to scale 30 for unknown values', () => {
  assert.equal(getHaloSizeOption('missing').key, '30');
});

test('builds window menu with scale radio items and hide command', () => {
  const template = buildContextMenuTemplate({
    currentSize: '40',
    onSizeChange: () => {},
    onClose: () => {},
  });

  assert.deepEqual(
    template.map((item) => [item.label, item.type, item.checked ?? false]),
    [
      ['10', 'radio', false],
      ['20', 'radio', false],
      ['30', 'radio', false],
      ['40', 'radio', true],
      ['50', 'radio', false],
      ['60', 'radio', false],
      [undefined, 'separator', false],
      ['隐藏悬浮栏', 'normal', false],
    ],
  );
});

test('builds tray menu with show toggle, scale items, and quit command', () => {
  const template = buildTrayMenuTemplate({
    currentSize: '30',
    isVisible: false,
    onToggleVisibility: () => {},
    onSizeChange: () => {},
    onQuit: () => {},
  });

  assert.deepEqual(
    template.map((item) => [item.label, item.type, item.checked ?? false]),
    [
      ['显示悬浮栏', 'normal', false],
      [undefined, 'separator', false],
      ['10', 'radio', false],
      ['20', 'radio', false],
      ['30', 'radio', true],
      ['40', 'radio', false],
      ['50', 'radio', false],
      ['60', 'radio', false],
      [undefined, 'separator', false],
      ['退出', 'normal', false],
    ],
  );
});
