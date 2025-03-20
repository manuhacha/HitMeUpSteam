import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { HttpClient } from '@angular/common/http';
import { SteamAPIService } from '../../Service/Steam/steam-api.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { NotificationService } from '../../Service/Notification/notification.service';
import { forkJoin, of, switchMap } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent,NgFor,NgIf,NgClass,FormsModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  games: any[] = []
  error = ''
  isOpen = false;
  isSetPriceOpen = false;
  maximumpricelimit = null
  isBelowLimit = false
  private intervalId: any;
  gameName = ''
  NumberOfGamesOnSale = 0
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
          id: game.id,
          pricelimit: game.pricelimit,
          //Convertimos string en float para comparar y poner el juego como rebajado
          onSale: parseFloat(game.price.replace('€', '').trim()) < parseFloat(game.originalprice.replace('€', '').trim()),
          belowLimit: game.pricelimit !== null 
            ? parseFloat(game.price.replace('€', '').trim()) <= parseFloat(game.pricelimit.replace('€', '').trim()) 
            : false
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
        this.closeModal();
        // Filtrar el juego eliminado
        this.games = this.games.filter(g => g.id !== game.id);
        if (this.games.length === 0) {
          this.error = 'You have no games in your list';
        }
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

  openLimitModal(game:any) {
    if (game.pricelimit !== null) {
      this.maximumpricelimit = game.pricelimit.replace('€','')
    }
    this.selectedGame = game
    this.isSetPriceOpen = true;
  }

  closeLimitModal() {
    this.isSetPriceOpen = false;
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
          this.isBelowLimit = false;
          this.updatedgame.price = res.items[0]?.price ? (res.items[0].price.final) / 100 + '€' : 'Not available';
          this.updatedgame.originalprice = res.items[0]?.price ? (res.items[0].price.initial) / 100 + '€' : 'Not available';
  
          if (parseFloat(this.updatedgame.price.replace('€', '').trim()) !== parseFloat(game.price.replace('€', '').trim()) ||
              parseFloat(this.updatedgame.originalprice.replace('€', '').trim()) !== parseFloat(game.originalprice.replace('€', '').trim())) {

            if (parseFloat(this.updatedgame.price.replace('€', '').trim()) <= parseFloat(game.price.replace('€', '').trim()) && game.pricelimit !== null) {
                this.NumberOfGamesOnSale++;
                this.gameName = game.name
                this.isBelowLimit = true
              }   
            else if (parseFloat(this.updatedgame.price.replace('€', '').trim()) < parseFloat(game.price.replace('€', '').trim()) && this.isBelowLimit === false) {
                this.NumberOfGamesOnSale++;
                this.gameName = game.name
              }
              return this.service.updateGame(game.id, this.updatedgame);
          }
  
          return of(null); // No hay cambios
        })
      )
    );
  
    // Esperar a que todas las actualizaciones terminen antes de llamar a getGames()
    forkJoin(updateObservables).subscribe(() => {
      if (this.NumberOfGamesOnSale > 1) {
        this.sendNotification('New sales! 🔥', 'Your list has games on sale');
      }
      if (this.NumberOfGamesOnSale === 1 && !this.isBelowLimit ) {
          this.sendNotification('New sale! 🔥', 'The game ' + this.gameName + ' is on sale');
      }
      if (this.isBelowLimit && this.NumberOfGamesOnSale === 1) {
        this.sendNotification('New sale! 🔥', 'The game ' + this.gameName + ' is below your price limit');
      }
      this.getGames();
      this.NumberOfGamesOnSale = 0
    });
  }

  setPriceLimit() {
    this.service.updateMaximumPrice(this.selectedGame.id,this.maximumpricelimit)
    .subscribe({
      next: (res) => {
        this.closeLimitModal()
        this.maximumpricelimit = null
        this.getGames()
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  deletePriceLimit(game:any) {
    this.selectedGame = game
    this.service.updateMaximumPrice(this.selectedGame.id, null)
    .subscribe({
      next: (res) => {
        this.getGames()
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  // editGame(game:any) {
  //     this.updatedgame.originalprice = '499.99€'
  //     this.updatedgame.price = '999.99€'
  //     this.service.updateGame(game.id,this.updatedgame)
  //     .subscribe({
  //       next: (res) => {
  //         this.getGames()
  //       },
  //       error: (err) => {
  //         console.log(err)
  //       }
  //     })
  // }
}
