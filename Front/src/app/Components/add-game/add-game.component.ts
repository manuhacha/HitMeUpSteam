import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SteamAPIService } from '../../Service/steam-api.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-game',
  imports: [HeaderComponent,FormsModule,ReactiveFormsModule],
  templateUrl: './add-game.component.html',
  styleUrl: './add-game.component.css'
})
export class AddGameComponent {

  gamename = ''

  constructor(private service: SteamAPIService) { }

  addGame() {
    this.service.getGameByName(this.gamename)
    .subscribe({
      next: (res) => {
        console.log(res)
      }, 
      error: (err) => {
        console.log(err)
      }
    })
  }
}
