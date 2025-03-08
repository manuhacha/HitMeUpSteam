import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { HttpClient } from '@angular/common/http';
import { SteamAPIService } from '../../Service/steam-api.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent,NgFor],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  games: any[] = []
  error = ''

  constructor(private http: HttpClient, private service: SteamAPIService) {  }

  ngOnInit() {
    this.getAlbums();
  }

  getAlbums() {
    this.service.getAllGames()
    .subscribe({
      next: (res) => {
        console.log(res)
        this.games = res.map((game:any) => ({
          name: game.title,
          price: game.price,
          originalprice: game.originalprice,
          desiredprice: game.desiredprice,
          picture: game.picture
        }))
      },
      error: (err) => {
        this.error = 'Error loading your games'
      }
    })
  }
}
