import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { HttpClient } from '@angular/common/http';
import { SteamAPIService } from '../../Service/steam-api.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { window } from 'rxjs';
import { NotificationService } from '../../Service/notification.service';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent,NgFor,NgIf,NgClass],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  games: any[] = []
  error = ''
  isOpen = false;
  private intervalId: any;
  ejemplo = 1
  gameName = ''
  updatedgame = {
    title: '',
    price: '',
    originalprice: '',
  }


  constructor(private http: HttpClient, private service: SteamAPIService, private notification: NotificationService,private router: Router) {  }

  ngOnInit() {
    this.getGames()
    // Ejecutar el método cada hora
    this.intervalId = setInterval(() => {
      this.refreshData();
      this.getGames();
    }, 3600000); // 3600000 ms = 1 hora
  }
  ngOnDestroy() {
    // Limpiar el intervalo cuando el componente se destruya
    clearInterval(this.intervalId);
  }

  getGames() {
    this.service.getAllGames()
    .subscribe({
      next: (res) => {
        this.games = res.map((game:any) => ({
          name: game.title,
          price: game.price,
          originalprice: game.originalprice,
          picture: game.picture,
          id: game._id,
          //Convertimos string en float para comparar y poner el juego como rebajado
          onSale: parseFloat(game.price.replace('€', '').trim()) < parseFloat(game.originalprice.replace('€', '').trim())
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

  //Enviar notificación
  sendNotification(title:string,message:string) {
    this.notification.sendNotification('Pollas','Gordas');
  } 

  //Comprobar y actualizar si han cambiado los datos al obtener los juegos
  refreshData() {
    this.games.forEach(game => {
      this.service.getGameByName(game.name)
      .subscribe({
        next: (res) => {
          this.updatedgame.price = res.items[0].price ? (res.items[0].price.final) / 100 + '€' : 'Not available'
          this.updatedgame.originalprice = res.items[0].price ? (res.items[0].price.initial) / 100 + '€' : 'Not available'          
          if (this.updatedgame.price == game.price && this.updatedgame.originalprice == game.originalprice) {

          }
          else {
            console.log(this.updatedgame.price)
            console.log(game.price)
            if (this.updatedgame.price < game.price) {
              console.log('pene')
              this.sendNotification('New sale','The game ' + game.name + ' is now on sale')
            }
            this.service.updateGame(game.id, this.updatedgame)
            .subscribe({
              next: (res) => {
  
              },
              error: (err) => {
              }
            })
          }
        },
        error: (err) => {

        }
      })
    });
    this.games.length = 0
    this.getGames()
  }
}
