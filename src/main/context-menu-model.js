export const HALO_SIZE_OPTIONS = [
  { key: 'small', label: '小号', windowSize: 240 },
  { key: 'medium', label: '中号', windowSize: 300 },
  { key: 'large', label: '大号', windowSize: 380 },
];

export function getHaloSizeOption(value) {
  return HALO_SIZE_OPTIONS.find((option) => option.key === value) ?? HALO_SIZE_OPTIONS[1];
}

export function buildContextMenuTemplate({ currentSize, onSizeChange, onClose }) {
  return [
    ...HALO_SIZE_OPTIONS.map((option) => ({
      label: option.label,
      type: 'radio',
      checked: option.key === getHaloSizeOption(currentSize).key,
      click: () => onSizeChange(option.key),
    })),
    { type: 'separator' },
    {
      label: '关闭悬浮栏',
      type: 'normal',
      click: onClose,
    },
  ];
}
