import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { AutoLaunchService } from '../../Service/AutoLaunch/auto-launch.service';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../Service/Notification/notification.service';

@Component({
  selector: 'app-settings',
  imports: [HeaderComponent,FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})



export class SettingsComponent {

  constructor(private autolaunchservice: AutoLaunchService, private notifications: NotificationService) {  }

  autoLaunch: boolean = true;
  sendNotifications: boolean = true;

  ngOnInit() {
    this.autolaunchservice.getAutoLaunchStatus().then(status => {
      this.autoLaunch = status;
    });
    this.notifications.getSendNotificationsStatus().then(status => {
      this.sendNotifications = status;
    });
  }

  toggleAutoLaunch(event:any) {
    this.autoLaunch = event.target.checked
    this.autolaunchservice.ToggleAutoLaunch(this.autoLaunch)
  }

  toggleSendNotifications(event:any) {
    this.sendNotifications = event.target.checked
    this.notifications.ToggleSendNotifications(this.sendNotifications)
  }

}
