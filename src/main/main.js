import { app, BrowserWindow, Menu } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWindowOptions } from './window-config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow(buildWindowOptions());
  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});
