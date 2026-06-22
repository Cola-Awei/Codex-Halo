const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('codexHalo', {
  onStateChange: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on('halo:state', listener);
    return () => ipcRenderer.removeListener('halo:state', listener);
  },
  onSizeChange: (callback) => {
    const listener = (_event, size) => callback(size);
    ipcRenderer.on('halo:size', listener);
    return () => ipcRenderer.removeListener('halo:size', listener);
  },
  openContextMenu: () => ipcRenderer.send('halo:open-menu'),
  openSizePanel: (position) => ipcRenderer.send('halo:open-menu', position),
  setSizePercent: (value) => ipcRenderer.send('halo:size-set', value),
  closeSettings: () => ipcRenderer.send('halo:settings-close'),
  hideWindow: () => ipcRenderer.send('halo:hide-window'),
  startDrag: (position) => ipcRenderer.send('halo:drag-start', position),
  moveDrag: (position) => ipcRenderer.send('halo:drag-move', position),
  endDrag: () => ipcRenderer.send('halo:drag-end'),
});
