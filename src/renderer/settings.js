const slider = document.querySelector('#sizeSlider');
const value = document.querySelector('#sizeValue');
const closeButton = document.querySelector('#closeButton');
const hideButton = document.querySelector('#hideButton');

function normalizePercent(nextValue) {
  const numericValue = Number(nextValue);
  if (!Number.isFinite(numericValue)) return 30;
  return Math.min(100, Math.max(0, Math.round(numericValue)));
}

function renderSize(nextValue) {
  const percent = normalizePercent(nextValue);
  slider.value = String(percent);
  value.textContent = `${percent}%`;
  document.body.style.setProperty('--size-percent', `${percent}%`);
}

slider.addEventListener('input', () => {
  renderSize(slider.value);
  window.codexHalo?.setSizePercent(slider.value);
});

closeButton.addEventListener('click', () => {
  window.codexHalo?.closeSettings();
});

hideButton.addEventListener('click', () => {
  window.codexHalo?.hideWindow();
  window.codexHalo?.closeSettings();
});

if (window.codexHalo) {
  window.codexHalo.onSizeChange(renderSize);
}

renderSize(slider.value);
