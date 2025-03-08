import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SteamAPIService } from '../../Service/steam-api.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgFor } from '@angular/common';

@Component({
  selector: 'app-add-game',
  imports: [HeaderComponent,FormsModule,ReactiveFormsModule,NgClass,NgFor],
  templateUrl: './add-game.component.html',
  styleUrl: './add-game.component.css'
})
export class AddGameComponent {

  gamename = ''
  result = ''
  isSuccess = false;
  isError = false;
  games: any[] = []
  constructor(private service: SteamAPIService) { }

  addGame() {
    this.service.getGameByName(this.gamename)
    .subscribe({
      next: (res) => {
        this.isSuccess = true
        this.isError = false
        console.log(res)
        //Extraemos solo los datos necesarios de la respuesta
        this.games = res.items.map((game: any) => ({
          name: game.name,
          price: game.price ? (game.price.final / 100) + '€' : 'Not available',
          originalprice: game.price ? (game.price.initial / 100) + '€' : 'Not available',    
          image: game.tiny_image
        }))
      }, 
      error: (err) => {
        this.isError = true
        this.isSuccess = false
        this.result = JSON.stringify(err)
      }
    })
  }
}
