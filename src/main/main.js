import { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  findLatestCodexSessionFile,
  readStatusFromCodexSession,
} from './codex-session-status.js';
import {
  buildContextMenuTemplate,
  buildTrayMenuTemplate,
  getHaloSizeOption,
} from './context-menu-model.js';
import { buildWindowOptions } from './window-config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRAY_ICON_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANuSURBVFhH7ZZNSBVRGIbdtWshzdUgCCSIaFHQwkXgJqSgoIW18M4IbvqBIjcaFJXNuYr9IRmBUHBbiBTkQqiN4uaCcCFKiJCIzAzN0qQkK8N+jGdmzu3M59xxLi3a+MJZ3Dvf33nP+33nlJWtoURY6badKTtTb9kqY9lu79+luisc9xTfpc8/Y8u+rnUkTdluLmW7Y6zNRy+PV6uet3ptb+5+o79hZ9mqpfJQuyVjlYwN6UyN5ag8gXdduDN1fOj5wsUX8z86Z5aXoxbfa671vQsKGaFwGTMxoJlA7K750eQ3mSxunR+dW9p96d60X4jqK7db18v4sUil3Ss4H8wOfbg6tfRbJki6jgw8+7yxsf2VZbsPEhehd3747vBHGdBcp59ML8IMK67IpuHxr7oI9CTzhcCZk7yuJzcnA+mkxhmHFmJEA9KHxf/YIE6ZswBf7W6OM5c74vfemw9nCuJKu+cotsJxq1OOW0tgy1aDWqxRQt3T1f+e75UNapvM7cFyVCMGUnAk14IiURyNXjGOym9tujEhi2gbW/jpH4Xqln4e2AE0ysrZueWoUXYsfaJQbrdugkmKkEwiao/FdEdVyMmfcO4YqjUdYMOnPXMs5LAKvKOJ0BIs8D9TM+RAAj7IigPqc3G0FwNUV53ofC1j7jhze3LFMfAH4jMNOyYWf3FmK6pNCM3qydzLL2bc4EjzYWNbDdJepiEt59HvuLUh44QIumqs/n7+kxmX+cL/IWNopjLTED1ECqYE4C8HWkP/43mvHc3LiitVdoAeHkX7dhVoBmQBemN0S8E4Zass4jAN6WMMLcetC0VOCAqP6ixakbYOGTNgEJxULCpmhoeMEwLxUgCtZ8aE6RUxERrGCM801udFX4ccVgE3H0qXwtadxSgPOSAIaNl/a2DWdIARJhoiTXqd+mevsiTiXWDG0+cf+XTjGsZJUnb26ex3nmBJ7nSdPOrsWcEQGpR+HrRoJAtmEQSXfiYsJ3O9WPLC7uNEjRgx4hEhAzBQ4tqSecF3VC596aiAxV7pFwIUQhHG7NoMUriYikxGdsZ36UfyQEcjiYaavk4pwuwKHhQINTRADOgbkM6JSl6MuUjoIgiIcIIg8U+qYKJiR7GMdq/lSk2uERxHix9UZSvS6oC0kfD6P3jU+gW7vYloX8P/wh98/b2p/DAFlAAAAABJRU5ErkJggg==';

let mainWindow;
let tray;
let currentSize = '30';
let dragOffset;
let statusTimer;
let currentStatus = 'thinking';
let sessionFile;
let isQuitting = false;

function createTrayIcon() {
  return nativeImage.createFromDataURL(TRAY_ICON_DATA_URL);
}

function refreshTrayMenu() {
  if (!tray) return;
  tray.setContextMenu(
    Menu.buildFromTemplate(
      buildTrayMenuTemplate({
        currentSize,
        isVisible: Boolean(mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()),
        onToggleVisibility: toggleWindowVisibility,
        onSizeChange: applyHaloSize,
        onQuit: quitApp,
      }),
    ),
  );
}

function showWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.show();
  mainWindow.focus();
  refreshTrayMenu();
}

function hideWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.hide();
  refreshTrayMenu();
}

function toggleWindowVisibility() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isVisible()) {
    hideWindow();
  } else {
    showWindow();
  }
}

function quitApp() {
  isQuitting = true;
  app.quit();
}

function applyHaloSize(sizeKey) {
  currentSize = getHaloSizeOption(sizeKey).key;
  const size = getHaloSizeOption(currentSize).windowSize;
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setSize(size, size, true);
    mainWindow.webContents.send('halo:size', currentSize);
  }
  refreshTrayMenu();
}

function showContextMenu() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const menu = Menu.buildFromTemplate(
    buildContextMenuTemplate({
      currentSize,
      onSizeChange: applyHaloSize,
      onClose: hideWindow,
    }),
  );
  menu.popup({ window: mainWindow });
}

function createTray() {
  tray = new Tray(createTrayIcon());
  tray.setToolTip('Codex Halo');
  tray.on('click', toggleWindowVisibility);
  tray.on('double-click', showWindow);
  refreshTrayMenu();
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
  mainWindow.on('close', (event) => {
    if (isQuitting) return;
    event.preventDefault();
    mainWindow.hide();
    refreshTrayMenu();
  });
  mainWindow.on('show', refreshTrayMenu);
  mainWindow.on('hide', refreshTrayMenu);
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
  createTray();
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (statusTimer) clearInterval(statusTimer);
});

ipcMain.on('halo:open-menu', showContextMenu);
ipcMain.on('halo:drag-start', (_event, position) => startDrag(position));
ipcMain.on('halo:drag-move', (_event, position) => moveDrag(position));
ipcMain.on('halo:drag-end', endDrag);
