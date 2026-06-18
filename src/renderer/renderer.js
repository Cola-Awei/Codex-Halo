import { getHaloViewState } from './halo-view-model.js';
import { nextState } from '../shared/status-model.js';

const halo = document.querySelector('#halo');
const stateZh = document.querySelector('#stateZh');
const stateEn = document.querySelector('#stateEn');
const stateHint = document.querySelector('#stateHint');
let currentState = 'idle';

function renderState(value) {
  const view = getHaloViewState(value);
  currentState = view.key;
  halo.className = `halo ${view.className}`;
  stateZh.textContent = view.zh;
  stateEn.textContent = view.en;
  stateHint.textContent = view.hint;
}

function advanceState() {
  renderState(nextState(currentState));
}

renderState('idle');

setInterval(advanceState, 4000);

window.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  advanceState();
});
