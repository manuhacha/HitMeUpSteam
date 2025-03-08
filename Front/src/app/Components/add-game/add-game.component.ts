import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SteamAPIService } from '../../Service/steam-api.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgFor } from '@angular/common';
import { debounceTime, Subject } from 'rxjs';

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
  gameToAdd:any = {
    title: '',
    price: '',
    originalprice: '',
    desiredprice: '',
    image: ''
  }
  //Variable para guardar el juego clickado
  selectedGame:any = null;
  private inputSubject = new Subject<string>();
  constructor(private service: SteamAPIService) {
    this.inputSubject.pipe(debounceTime(500))
    .subscribe(value => {
      this.onInputFinished(value)
    })
   }

  searchGame() {
    this.service.getGameByName(this.gamename)
    .subscribe({
      next: (res) => {
        if (res.items.length == 0) {
          this.isError = true
          this.isSuccess = false
          this.result = 'Game not found'
        }
        else {
        //Extraemos solo los datos necesarios de la respuesta
        this.isSuccess = true
        this.isError = false
        this.games = res.items.map((game: any) => ({
          name: game.name,
          price: game.price ? (game.price.final / 100) + '€' : 'Not available',
          originalprice: game.price ? (game.price.initial / 100) + '€' : 'Not available',    
          image: game.tiny_image
        }))
        }
      }, 
      error: (err) => {
        this.isError = true
        this.isSuccess = false
        this.result = JSON.stringify(err.error)
      }
    })
  }

  selectGame(game:any) {
    if (this.selectedGame == game) {
      this.selectedGame = null
    }
    else {
      this.selectedGame = game
    }
  }

  addGame(gameToAdd:any) {
    this.gameToAdd.title = this.selectedGame.name
    this.gameToAdd.price = this.selectedGame.price
    this.gameToAdd.originalprice = this.selectedGame.originalprice
    this.gameToAdd.picture = this.selectedGame.image
    this.service.addGame(gameToAdd)
    .subscribe({
      next: (res) => {
        this.isSuccess = true
        this.isError = false
        this.games = []
        this.result = res
      },
      error: (err) => {
        console.log(this.isError)
        this.result = JSON.stringify(err.error)
        this.isError = true
        this.isSuccess = false
      }
    })
  }

  onInputChange(event: any) {
    this.inputSubject.next(event.target.value)
  }
  onInputFinished(value: string) {
    this.searchGame()
  }
}
