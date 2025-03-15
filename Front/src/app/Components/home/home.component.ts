import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { HttpClient } from '@angular/common/http';
import { SteamAPIService } from '../../Service/steam-api.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { NotificationService } from '../../Service/notification.service';
import { forkJoin, of, switchMap } from 'rxjs';

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
  gameName = ''
  selectedGame:any = null
  updatedgame = {
    price: '',
    originalprice: '',
  }


  constructor(private http: HttpClient, private service: SteamAPIService, private notification: NotificationService) {  }

  ngOnInit() {
    this.getGames()
    this.refreshData()
    // Ejecutar el método cada hora
    this.intervalId = setInterval(() => {
      this.refreshData();
    }, 10000); // 3600000 ms = 1 hora
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

  deleteGame(game: any) {
    this.service.deleteGame(game.id).subscribe({
      next: (res) => {
        this.isOpen = false; // Cerrar el modal
        // Filtrar el juego eliminado
        this.games = this.games.filter(g => g.id !== game.id);
      },
      error: (err) => {
        this.error = err.error;
      }
    });
  }  

  //Modal
  openModal(game:any) {
    this.selectedGame = game
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
  }

  //Enviar notificación
  sendNotification(title:string,message:string) {
    this.notification.sendNotification(title,message);
  } 

  //Comprobar y actualizar si han cambiado los datos al obtener los juegos
  refreshData() {
    const updateObservables = this.games.map(game =>
      this.service.getGameByName(game.name).pipe(
        switchMap((res: any) => {
          this.updatedgame.price = res.items[0]?.price ? (res.items[0].price.final) / 100 + '€' : 'Not available';
          this.updatedgame.originalprice = res.items[0]?.price ? (res.items[0].price.initial) / 100 + '€' : 'Not available';
  
          if (parseFloat(this.updatedgame.price.replace('€', '').trim()) !== parseFloat(game.price.replace('€', '').trim()) ||
              parseFloat(this.updatedgame.originalprice.replace('€', '').trim()) !== parseFloat(game.originalprice.replace('€', '').trim())) {
  
            if (parseFloat(this.updatedgame.price.replace('€', '').trim()) < parseFloat(game.price.replace('€', '').trim())) {
              this.sendNotification('New sale', 'The game ' + game.name + ' is now on sale');
            }
  
            return this.service.updateGame(game.id, this.updatedgame);
          }
  
          return of(null); // No hay cambios
        })
      )
    );
  
    // Esperar a que todas las actualizaciones terminen antes de llamar a getGames()
    forkJoin(updateObservables).subscribe(() => {
      this.getGames();
    });
  }
}
