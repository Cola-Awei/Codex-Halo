export const HALO_SIZE_OPTIONS = [
  { key: '10', label: '10', windowSize: 160 },
  { key: '20', label: '20', windowSize: 220 },
  { key: '30', label: '30', windowSize: 300 },
  { key: '40', label: '40', windowSize: 380 },
  { key: '50', label: '50', windowSize: 460 },
  { key: '60', label: '60', windowSize: 540 },
];

export function getHaloSizeOption(value) {
  return HALO_SIZE_OPTIONS.find((option) => option.key === String(value)) ?? HALO_SIZE_OPTIONS[2];
}

function buildScaleItems({ currentSize, onSizeChange }) {
  return HALO_SIZE_OPTIONS.map((option) => ({
    label: option.label,
    type: 'radio',
    checked: option.key === getHaloSizeOption(currentSize).key,
    click: () => onSizeChange(option.key),
  }));
}

export function buildContextMenuTemplate({ currentSize, onSizeChange, onClose }) {
  return [
    ...buildScaleItems({ currentSize, onSizeChange }),
    { type: 'separator' },
    {
      label: '隐藏悬浮栏',
      type: 'normal',
      click: onClose,
    },
  ];
}

export function buildTrayMenuTemplate({
  currentSize,
  isVisible,
  onToggleVisibility,
  onSizeChange,
  onQuit,
}) {
  return [
    {
      label: isVisible ? '隐藏悬浮栏' : '显示悬浮栏',
      type: 'normal',
      click: onToggleVisibility,
    },
    { type: 'separator' },
    ...buildScaleItems({ currentSize, onSizeChange }),
    { type: 'separator' },
    {
      label: '退出',
      type: 'normal',
      click: onQuit,
    },
  ];
}
