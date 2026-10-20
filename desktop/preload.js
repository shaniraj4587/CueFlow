const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  keepAwake: (activate) => ipcRenderer.invoke('app:keepAwake', activate),
  importTextDocument: () => ipcRenderer.invoke('app:importTextDocument'),
  exportTextFile: (title, content) => ipcRenderer.invoke('app:exportTextFile', { title, content }),
  launchOverlay: (config) => ipcRenderer.invoke('overlay:launch', config),
  closeOverlay: () => ipcRenderer.invoke('overlay:close'),
  isOverlayRunning: () => ipcRenderer.invoke('overlay:isRunning'),
  onOverlayScroll: (callback) => {
    const sub = (_event, value) => callback(value);
    ipcRenderer.on('overlay:scrollUpdate', sub);
    return () => ipcRenderer.removeListener('overlay:scrollUpdate', sub);
  },
  onOverlayClosed: (callback) => {
    const sub = () => callback();
    ipcRenderer.on('overlay:closed', sub);
    return () => ipcRenderer.removeListener('overlay:closed', sub);
  },
});
