import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getHaloSizeFromPercent } from './halo-size-model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function buildWindowOptions(percent = 30) {
  const size = getHaloSizeFromPercent(percent).windowSize;
  return {
    width: size,
    height: size,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  };
}
