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
