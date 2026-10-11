const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  verificar: () => ipcRenderer.invoke('upd:check'),
  baixar: () => ipcRenderer.invoke('upd:baixar'),
  instalar: () => ipcRenderer.invoke('upd:instalar'),
  aoAtualizar: cb => ipcRenderer.on('upd', (_e, d) => cb(d))
});
