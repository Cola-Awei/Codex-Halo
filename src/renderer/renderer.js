import { getHaloViewState } from './halo-view-model.js';

const halo = document.querySelector('#halo');
const stateZh = document.querySelector('#stateZh');
const stateEn = document.querySelector('#stateEn');
const stateHint = document.querySelector('#stateHint');
let currentState = 'waiting';
let currentSize = 'medium';
let dragging = false;

function renderState(value) {
  const view = getHaloViewState(value);
  currentState = view.key;
  halo.className = `halo halo-size-${currentSize} ${view.className}`;
  stateZh.textContent = view.zh;
  stateEn.textContent = view.en;
  stateHint.textContent = view.hint;
}

function renderSize(value) {
  currentSize = ['small', 'medium', 'large'].includes(value) ? value : 'medium';
  renderState(currentState);
}

renderState('waiting');

window.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  window.codexHalo?.openContextMenu();
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
