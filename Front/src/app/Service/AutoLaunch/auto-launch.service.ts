import { Injectable } from '@angular/core';

declare global {
  interface Window {
    electron: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AutoLaunchService {

  constructor() { }

  ToggleAutoLaunch(enable:any) {
    if (window.electron) {
      window.electron.setAutoLaunch(enable)
    }
  }

    // Recupera el estado del archivo JSON (via ipcRenderer)
    getAutoLaunchStatus(): Promise<boolean> {
      return window.electron.getAutoLaunch();
    }
}
