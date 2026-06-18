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
  startDrag: (position) => ipcRenderer.send('halo:drag-start', position),
  moveDrag: (position) => ipcRenderer.send('halo:drag-move', position),
  endDrag: () => ipcRenderer.send('halo:drag-end'),
});
