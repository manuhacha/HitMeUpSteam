const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  showNotification: 
  (message,title) => ipcRenderer.invoke('show-notification', message,title),
  setAutoLaunch: 
  (enable) => ipcRenderer.invoke('set-auto-launch', enable),
  getAutoLaunch:
  () => ipcRenderer.invoke('get-auto-launch')
});


