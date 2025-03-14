import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { AutoLaunchService } from '../../Service/auto-launch.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  imports: [HeaderComponent,FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})



export class SettingsComponent {

  constructor(private autolaunchservice: AutoLaunchService) {  }

  autoLaunch: boolean = true;
  sendNotifications: boolean = true;

  ngOnInit() {
    this.autolaunchservice.getAutoLaunchStatus().then(status => {
      this.autoLaunch = status;
    });
  }

  toggleAutoLaunch(event:any) {
    this.autoLaunch = event.target.checked
    console.log(this.autoLaunch)
    this.autolaunchservice.ToggleAutoLaunch(this.autoLaunch)
  }

  toggleSendNotifications(event:any) {
    this.sendNotifications = event.target.checked
  }

}
