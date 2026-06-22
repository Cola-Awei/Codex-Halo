export function buildTrayMenuTemplate({
  isVisible,
  onToggleVisibility,
  onOpenSizePanel,
  onQuit,
}) {
  return [
    {
      label: isVisible ? '隐藏悬浮栏' : '显示悬浮栏',
      type: 'normal',
      click: onToggleVisibility,
    },
    {
      label: '设置大小...',
      type: 'normal',
      click: onOpenSizePanel,
    },
    { type: 'separator' },
    {
      label: '退出',
      type: 'normal',
      click: onQuit,
    },
  ];
}
