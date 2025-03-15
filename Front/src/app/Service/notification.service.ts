import { Injectable } from '@angular/core';

declare global {
  interface Window {
    electron: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }

  sendNotification(title:string,message:any) {
    if (window.electron) {
      window.electron.showNotification(title,message)
    }
  }

  ToggleSendNotifications(enable:any) {
    if (window.electron) {
      window.electron.setEnabledNotifications(enable)
    }
  }

  getSendNotificationsStatus(): Promise<boolean> {
    return window.electron.getNotificationStatus()
  }
}
