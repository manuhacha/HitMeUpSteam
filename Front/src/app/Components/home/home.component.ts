import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { HttpClient } from '@angular/common/http';
import { SteamAPIService } from '../../Service/steam-api.service';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent,NgFor,NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  games: any[] = []
  error = ''
  isOpen = false;

  constructor(private http: HttpClient, private service: SteamAPIService,private router: Router) {  }

  ngOnInit() {
    this.getGames();
  }

  getGames() {
    this.service.getAllGames()
    .subscribe({
      next: (res) => {
        console.log(res)
        this.games = res.map((game:any) => ({
          name: game.title,
          price: game.price,
          originalprice: game.originalprice,
          picture: game.picture,
          id: game._id
        }))
      },
      error: (err) => {
        this.error = err.error
      }
    })
  }

  deleteGame(game:any) {
    this.service.deleteGame(game.id)
    .subscribe({
      next: (res) => {
        this.isOpen = false
        this.games.length = 0
        this.getGames()
      },
      error: (err) => {
        this.error = err.error
      }
    })
  }

  //Modal
  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
  }
}
