const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  showNotification: 
  (title,message) => ipcRenderer.invoke('show-notification', title,message),
  setAutoLaunch: 
  (enable) => ipcRenderer.invoke('set-auto-launch', enable),
  getAutoLaunch:
  () => ipcRenderer.invoke('get-auto-launch'),
  setEnabledNotifications:
  (enable) => ipcRenderer.invoke('set-enabled-notifications',enable),
  getNotificationStatus:
  () => ipcRenderer.invoke('get-notifications'),
});


