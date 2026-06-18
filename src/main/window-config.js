import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getHaloSizeOption } from './context-menu-model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function buildWindowOptions(sizeKey = 'medium') {
  const size = getHaloSizeOption(sizeKey).windowSize;
  return {
    width: size,
    height: size,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  };
}
