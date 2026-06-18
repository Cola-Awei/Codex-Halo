# Codex Halo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable Electron desktop floating status light that shows only a draggable glowing Halo ring with status text inside.

**Architecture:** Use Electron for the transparent always-on-top desktop window, HTML/CSS for the Halo visual, and small shared JavaScript modules for status definitions and view mapping. Start with a mock status provider so the app is testable before a live Codex status source exists.

**Tech Stack:** Electron, vanilla HTML/CSS/JavaScript, Node built-in test runner.

---

## File Structure

- Create `package.json`: project metadata, scripts, Electron dependency declaration.
- Create `src/shared/status-model.js`: canonical state list, normalization, and next-state helper.
- Create `src/renderer/halo-view-model.js`: maps state keys to Chinese/English labels, hints, and CSS class names.
- Create `src/main/window-config.js`: pure function that returns Electron `BrowserWindow` options.
- Create `src/main/main.js`: Electron entry point, creates transparent frameless always-on-top window, cycles mock statuses.
- Create `src/main/preload.js`: exposes status events to the renderer through a narrow API.
- Create `src/renderer/index.html`: minimal circular widget markup.
- Create `src/renderer/styles.css`: transparent body and Halo ring visual/animations.
- Create `src/renderer/renderer.js`: receives state changes and updates DOM.
- Create `tests/status-model.test.js`: tests state normalization and sequencing.
- Create `tests/halo-view-model.test.js`: tests display mapping for the visual layer.
- Create `tests/window-config.test.js`: tests the frameless transparent always-on-top window contract.

## Task 1: Status Model

**Files:**
- Create: `package.json`
- Create: `tests/status-model.test.js`
- Create: `src/shared/status-model.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/status-model.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { STATE_KEYS, getStatus, normalizeState, nextState } from '../src/shared/status-model.js';

test('defines the five approved Codex Halo states in order', () => {
  assert.deepEqual(STATE_KEYS, ['idle', 'thinking', 'running', 'waiting', 'done']);
});

test('normalizes unknown states to idle', () => {
  assert.equal(normalizeState('thinking'), 'thinking');
  assert.equal(normalizeState('missing'), 'idle');
  assert.equal(normalizeState(undefined), 'idle');
});

test('returns labels and hints for idle', () => {
  assert.deepEqual(getStatus('idle'), {
    key: 'idle',
    zh: '待命',
    en: 'Idle',
    hint: '等待输入',
  });
});

test('cycles from done back to idle', () => {
  assert.equal(nextState('idle'), 'thinking');
  assert.equal(nextState('done'), 'idle');
  assert.equal(nextState('missing'), 'thinking');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`

Expected: FAIL because `src/shared/status-model.js` does not exist.

- [ ] **Step 3: Write minimal implementation**

```js
// src/shared/status-model.js
export const STATUS_DEFINITIONS = {
  idle: { key: 'idle', zh: '待命', en: 'Idle', hint: '等待输入' },
  thinking: { key: 'thinking', zh: '思考', en: 'Thinking', hint: '正在推理' },
  running: { key: 'running', zh: '执行', en: 'Running', hint: '正在执行' },
  waiting: { key: 'waiting', zh: '等待', en: 'Waiting', hint: '等待确认' },
  done: { key: 'done', zh: '完成', en: 'Done', hint: '任务完成' },
};

export const STATE_KEYS = ['idle', 'thinking', 'running', 'waiting', 'done'];

export function normalizeState(value) {
  return STATE_KEYS.includes(value) ? value : 'idle';
}

export function getStatus(value) {
  return STATUS_DEFINITIONS[normalizeState(value)];
}

export function nextState(value) {
  const normalized = normalizeState(value);
  const index = STATE_KEYS.indexOf(normalized);
  return STATE_KEYS[(index + 1) % STATE_KEYS.length];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`

Expected: PASS for all status model tests.

## Task 2: View Model And Window Contract

**Files:**
- Create: `tests/halo-view-model.test.js`
- Create: `tests/window-config.test.js`
- Create: `src/renderer/halo-view-model.js`
- Create: `src/main/window-config.js`

- [ ] **Step 1: Write failing tests**

```js
// tests/halo-view-model.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { getHaloViewState } from '../src/renderer/halo-view-model.js';

test('maps idle state to centered text and calm halo class', () => {
  assert.deepEqual(getHaloViewState('idle'), {
    key: 'idle',
    zh: '待命',
    en: 'Idle',
    hint: '等待输入',
    className: 'state-idle',
  });
});

test('maps unknown state to idle view state', () => {
  assert.equal(getHaloViewState('unknown').key, 'idle');
});
```

```js
// tests/window-config.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWindowOptions } from '../src/main/window-config.js';

test('builds a transparent frameless always-on-top floating window', () => {
  const options = buildWindowOptions();
  assert.equal(options.width, 300);
  assert.equal(options.height, 300);
  assert.equal(options.frame, false);
  assert.equal(options.transparent, true);
  assert.equal(options.alwaysOnTop, true);
  assert.equal(options.resizable, false);
  assert.equal(options.backgroundColor, '#00000000');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`

Expected: FAIL because the view model and window config files do not exist.

- [ ] **Step 3: Implement view model and window config**

```js
// src/renderer/halo-view-model.js
import { getStatus } from '../shared/status-model.js';

export function getHaloViewState(value) {
  const status = getStatus(value);
  return {
    key: status.key,
    zh: status.zh,
    en: status.en,
    hint: status.hint,
    className: `state-${status.key}`,
  };
}
```

```js
// src/main/window-config.js
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function buildWindowOptions() {
  return {
    width: 300,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`

Expected: PASS for status, view, and window config tests.

## Task 3: Electron App Shell

**Files:**
- Modify: `package.json`
- Create: `src/main/main.js`
- Create: `src/main/preload.js`
- Create: `src/renderer/index.html`
- Create: `src/renderer/renderer.js`

- [ ] **Step 1: Add Electron package metadata**

```json
{
  "name": "codex-halo",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "A draggable desktop floating Codex status halo.",
  "main": "src/main/main.js",
  "scripts": {
    "start": "electron .",
    "test": "node --test tests/*.test.js"
  },
  "devDependencies": {
    "electron": "^37.0.0"
  }
}
```

- [ ] **Step 2: Create Electron main and preload**

```js
// src/main/main.js
import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWindowOptions } from './window-config.js';
import { nextState } from '../shared/status-model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow;
let currentState = 'idle';
let cycleTimer;

function sendState() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('halo:state', currentState);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow(buildWindowOptions());
  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.webContents.once('did-finish-load', sendState);

  cycleTimer = setInterval(() => {
    currentState = nextState(currentState);
    sendState();
  }, 4000);
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
});

app.on('window-all-closed', () => {
  if (cycleTimer) clearInterval(cycleTimer);
  app.quit();
});

ipcMain.handle('halo:get-state', () => currentState);
ipcMain.handle('halo:next-state', () => {
  currentState = nextState(currentState);
  sendState();
  return currentState;
});
```

```js
// src/main/preload.js
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('codexHalo', {
  getState: () => ipcRenderer.invoke('halo:get-state'),
  nextState: () => ipcRenderer.invoke('halo:next-state'),
  onStateChange: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on('halo:state', listener);
    return () => ipcRenderer.removeListener('halo:state', listener);
  },
});
```

- [ ] **Step 3: Create renderer document and updater**

```html
<!-- src/renderer/index.html -->
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Codex Halo</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <main class="halo state-idle" id="halo">
      <section class="halo-core" aria-live="polite">
        <div class="halo-text">
          <div class="state-zh" id="stateZh">待命</div>
          <div class="state-en" id="stateEn">Idle</div>
          <div class="state-hint" id="stateHint">等待输入</div>
        </div>
      </section>
    </main>
    <script type="module" src="./renderer.js"></script>
  </body>
</html>
```

```js
// src/renderer/renderer.js
import { getHaloViewState } from './halo-view-model.js';

const halo = document.querySelector('#halo');
const stateZh = document.querySelector('#stateZh');
const stateEn = document.querySelector('#stateEn');
const stateHint = document.querySelector('#stateHint');

function renderState(value) {
  const view = getHaloViewState(value);
  halo.className = `halo ${view.className}`;
  stateZh.textContent = view.zh;
  stateEn.textContent = view.en;
  stateHint.textContent = view.hint;
}

renderState('idle');

if (window.codexHalo) {
  window.codexHalo.getState().then(renderState);
  window.codexHalo.onStateChange(renderState);
  window.addEventListener('contextmenu', async (event) => {
    event.preventDefault();
    renderState(await window.codexHalo.nextState());
  });
}
```

- [ ] **Step 4: Run tests**

Run: `npm test`

Expected: PASS.

## Task 4: Halo Visual Styling

**Files:**
- Create: `src/renderer/styles.css`

- [ ] **Step 1: Write CSS for the approved Halo-only visual**

```css
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  background: transparent;
}

body {
  display: grid;
  place-items: center;
  font-family: "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif;
  -webkit-app-region: drag;
  user-select: none;
}

.halo {
  width: 260px;
  height: 260px;
  border-radius: 50%;
  position: relative;
  display: grid;
  place-items: center;
  background: conic-gradient(from 12deg, var(--dim) 0deg 54deg, var(--bright) 54deg 137deg, var(--mid) 137deg 174deg, var(--dim) 174deg 224deg, var(--bright) 224deg 299deg, var(--dim) 299deg 360deg);
  box-shadow: 0 0 16px var(--glow-strong), 0 0 42px var(--glow), 0 0 72px var(--glow-soft);
  animation: halo-breathe var(--breath-speed) ease-in-out infinite;
}

.halo::before {
  content: "";
  position: absolute;
  inset: 21px;
  border-radius: 50%;
  background: radial-gradient(circle, #101820 0%, #080d12 72%, #030506 100%);
  box-shadow: inset 0 0 36px rgba(255, 255, 255, 0.03);
}

.halo-core {
  width: 116px;
  height: 116px;
  border-radius: 50%;
  background: rgba(18, 25, 32, 0.72);
  display: grid;
  place-items: center;
  position: relative;
  text-align: center;
  color: #fff;
}

.state-zh,
.state-en {
  font-family: Georgia, "Times New Roman", "Microsoft YaHei", serif;
  font-weight: 700;
  line-height: 1.04;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.72);
}

.state-zh { font-size: 29px; }
.state-en { font-size: 26px; }
.state-hint {
  margin-top: 12px;
  font-size: 10px;
  color: #a6bbc8;
}

.state-idle {
  --bright: #bffaff;
  --mid: #7df0ff;
  --dim: #0f3f55;
  --glow-strong: rgba(179, 249, 255, 0.86);
  --glow: rgba(111, 229, 255, 0.46);
  --glow-soft: rgba(70, 202, 236, 0.18);
  --breath-speed: 4.8s;
}

.state-thinking,
.state-running,
.state-waiting,
.state-done {
  animation-name: halo-breathe, halo-spin;
}

@keyframes halo-breathe {
  0%, 100% { filter: brightness(0.9); transform: scale(0.985); }
  50% { filter: brightness(1.12); transform: scale(1); }
}

@keyframes halo-spin {
  to { rotate: 360deg; }
}
```

- [ ] **Step 2: Run tests**

Run: `npm test`

Expected: PASS.

## Task 5: Install, Launch, And Verify

**Files:**
- Modify: `package-lock.json`

- [ ] **Step 1: Install dependencies**

Run: `npm install`

Expected: Electron installs and `package-lock.json` is generated.

- [ ] **Step 2: Run automated tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 3: Start the desktop app**

Run: `npm start`

Expected: a small transparent always-on-top Halo window appears. It can be dragged. The mock status cycles every four seconds. Right-click cycles state manually.

- [ ] **Step 4: Commit implementation**

```bash
git add package.json package-lock.json src tests docs/superpowers/plans/2026-06-18-codex-halo-implementation.md
git commit -m "Build Codex Halo desktop widget"
```
