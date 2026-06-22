import { getHaloViewState } from './halo-view-model.js';
import { getHaloSizeFromPercent } from '../shared/halo-size-model.js';

const halo = document.querySelector('#halo');
const stateZh = document.querySelector('#stateZh');
const stateEn = document.querySelector('#stateEn');
const stateHint = document.querySelector('#stateHint');
let currentState = 'thinking';
let currentSize = 30;
let dragging = false;

function renderState(value) {
  const view = getHaloViewState(value);
  currentState = view.key;
  halo.className = `halo ${view.className}`;
  stateZh.textContent = view.zh;
  stateEn.textContent = view.en;
  stateHint.textContent = view.hint;
}

function renderSize(value) {
  const size = getHaloSizeFromPercent(value);
  currentSize = size.percent;
  halo.style.setProperty('--halo-size', `${size.haloSize}px`);
  renderState(currentState);
}

renderState('thinking');

window.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  window.codexHalo?.openSizePanel({ x: event.screenX, y: event.screenY });
});

if (window.codexHalo) {
  window.codexHalo.onSizeChange(renderSize);
  window.codexHalo.onStateChange(renderState);
}

window.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  dragging = true;
  document.body.setPointerCapture(event.pointerId);
  window.codexHalo?.startDrag({ screenX: event.screenX, screenY: event.screenY });
});

window.addEventListener('pointermove', (event) => {
  if (!dragging) return;
  window.codexHalo?.moveDrag({ screenX: event.screenX, screenY: event.screenY });
});

function stopDragging(event) {
  if (!dragging) return;
  dragging = false;
  if (document.body.hasPointerCapture(event.pointerId)) {
    document.body.releasePointerCapture(event.pointerId);
  }
  window.codexHalo?.endDrag();
}

window.addEventListener('pointerup', stopDragging);
window.addEventListener('pointercancel', stopDragging);
