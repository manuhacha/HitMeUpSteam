const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  showNotification: 
  (message,title) => ipcRenderer.invoke('show-notification', message,title),
});
