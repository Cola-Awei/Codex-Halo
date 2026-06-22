import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTrayMenuTemplate } from '../src/main/context-menu-model.js';

test('builds tray menu with visibility toggle, size panel command, and quit command', () => {
  const template = buildTrayMenuTemplate({
    isVisible: false,
    onToggleVisibility: () => {},
    onOpenSizePanel: () => {},
    onQuit: () => {},
  });

  assert.deepEqual(
    template.map((item) => [item.label, item.type]),
    [
      ['显示悬浮栏', 'normal'],
      ['设置大小...', 'normal'],
      [undefined, 'separator'],
      ['退出', 'normal'],
    ],
  );
});
