import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  findLatestCodexSessionFile,
  readStatusFromCodexSession,
} from './codex-session-status.js';
import { buildContextMenuTemplate, getHaloSizeOption } from './context-menu-model.js';
import { buildWindowOptions } from './window-config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow;
let currentSize = 'medium';
let dragOffset;
let statusTimer;
let currentStatus = 'waiting';
let sessionFile;

function applyHaloSize(sizeKey) {
  currentSize = getHaloSizeOption(sizeKey).key;
  const size = getHaloSizeOption(currentSize).windowSize;
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setSize(size, size, true);
    mainWindow.webContents.send('halo:size', currentSize);
  }
}

function showContextMenu() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const menu = Menu.buildFromTemplate(
    buildContextMenuTemplate({
      currentSize,
      onSizeChange: applyHaloSize,
      onClose: () => mainWindow.close(),
    }),
  );
  menu.popup({ window: mainWindow });
}

function startDrag({ screenX, screenY }) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const [windowX, windowY] = mainWindow.getPosition();
  dragOffset = {
    x: screenX - windowX,
    y: screenY - windowY,
  };
}

function moveDrag({ screenX, screenY }) {
  if (!mainWindow || mainWindow.isDestroyed() || !dragOffset) return;
  mainWindow.setPosition(
    Math.round(screenX - dragOffset.x),
    Math.round(screenY - dragOffset.y),
    false,
  );
}

function endDrag() {
  dragOffset = undefined;
}

function pushStatus() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  sessionFile = sessionFile ?? findLatestCodexSessionFile();
  const nextStatus = readStatusFromCodexSession(sessionFile);
  if (nextStatus !== currentStatus) {
    currentStatus = nextStatus;
    mainWindow.webContents.send('halo:state', currentStatus);
  }
}

function startStatusMonitor() {
  pushStatus();
  statusTimer = setInterval(() => {
    sessionFile = findLatestCodexSessionFile();
    pushStatus();
  }, 1000);
}

function createWindow() {
  mainWindow = new BrowserWindow(buildWindowOptions(currentSize));
  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  mainWindow.webContents.on('context-menu', showContextMenu);
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.send('halo:size', currentSize);
    mainWindow.webContents.send('halo:state', currentStatus);
    startStatusMonitor();
  });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
});

app.on('window-all-closed', () => {
  if (statusTimer) clearInterval(statusTimer);
  app.quit();
});

ipcMain.on('halo:open-menu', showContextMenu);
ipcMain.on('halo:drag-start', (_event, position) => startDrag(position));
ipcMain.on('halo:drag-move', (_event, position) => moveDrag(position));
ipcMain.on('halo:drag-end', endDrag);
